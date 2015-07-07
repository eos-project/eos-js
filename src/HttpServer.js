"use strict";

var WebSocketServer = require("ws").Server
    , uuid = require("uuid")
    , http = require("http")
    , buildFilter = require("./Filters")
    , express = require("express")
    , log = require("sgwin").with("http");


var totalAppenders = 0;
var nullFunc = function () {};

/**
 * Websocket appender, created for each websocket connection
 *
 * @param {object}     ws
 * @param {Dispatcher} dispatcher
 * @param {Function}   auth
 * @constructor
 */
var WebsocketAppender = function WebsocketAppender(ws, dispatcher, auth) {
    this.ws = ws;
    this.dispatcher = dispatcher;
    this.auth = auth;
    this.registered = false;
    this.filterString = null;
    this.filter = null;
    this.uuid = uuid.v4();

    this.packetsOut = 0;
    this.packetsFiltered = 0;

    totalAppenders++;

    // Building appender
    var that = this;
    this.appender = function (key, payload) {
        setImmediate(that.toBrowser.bind(that), key, payload);
    };

    // Registering events
    this.ws.on("message", this.authenticate.bind(this));
    this.ws.on("close", this.onClose.bind(this));

    // Sending initial packet
    this.ws.send("uuid\n" + this.uuid, nullFunc);
};

/**
 * Callback, used to deliver message to client using websocket
 * Invoked from Dispatcher
 *
 * @param {EosKey} key
 * @param {string} payload
 */
WebsocketAppender.prototype.toBrowser = function toBrowser(key, payload) {
    this.packetsOut++;
    if (!this.filter(key)) {
        this.packetsFiltered++;
        return;
    }
    log.out("Sending packet to client");
    this.ws.send(
        "log\n" +
        key.withoutRealm() + "\n" +
        payload,
        nullFunc
    );
};

/**
 * Callback, registered to websocket "message" event
 * Used to authenticate incoming connection
 *
 * @param data
 */
WebsocketAppender.prototype.authenticate = function authenticate(data) {
    data = data.split("\n");
    log.in("Received :type", {type: data[0]});
    if (data[0] === "subscribe") {
        if (data.length !== 5) {
            log.warn("Invalid subscribe packet");
            this.ws.send("error\nInvalid subscribe packet", nullFunc);
        } else {
            var realm = data[1];
            var nonce = data[2];
            this.filterString = data[3];
            this.filter = buildFilter(data[3]);
            var hash = data[4];

            if (!this.auth(realm, nonce, this.filterString, hash)) {
                log.warn("Invalid hash signature or realm :realm", {realm: realm});
                this.ws.send("error\nInvalid hash signature for realm " + realm, nullFunc);
            } else {
                // Auth success
                if (!this.registered) {
                    this.registered = true;
                    this.dispatcher.add(this.appender);
                }
                log.success("Websocket connection authenticated and registered");
                this.ws.send("connected\n");
            }
        }
    }
};

/**
 * Callback, registered to websocket "close" event
 * Used for cleanup
 */
WebsocketAppender.prototype.onClose = function onClose() {
    totalAppenders--;
    log.info("Websocket connection closed");
    // Unregister from dispatcher
    if (this.registered) {
        log.info("Listener unregistered");
        this.dispatcher.remove(this.appender)
    }
};

/**
 * HTTP Server
 *
 * @param {object} options
 * @constructor
 */
var HttpServer = function HttpServer(options) {
    this.port = options.port || 8090;

    this.auth = options.auth;
    this.dispatcher = options.dispatcher;
    this.server = null;     // Http server
    this.app = null;        // Express application
    this.wss = null;        // Websocket server
};

/**
 * Starts HTTP server
 *
 * @param {Function} clb
 */
HttpServer.prototype.start = function start(clb) {
    if (this.server !== null) {
        return;
    }
    var that = this;
    clb = clb || function () {};

    this.app = express();
    this.server = http.createServer(this.app);
    this.server.listen(this.port, clb);
    this.wss = new WebSocketServer({server: this.server});

    this.wss.on("connection", function (ws) {
        log.info("New websocket connection");
        new WebsocketAppender(ws, that.dispatcher, that.auth);
    });
};

module.exports = HttpServer;