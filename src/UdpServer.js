"use strict";

var dgram = require('dgram');

/**
 * UdpServer
 *
 * @param {object} options
 * @constructor
 */
var UdpServer = function UdpServer(options) {
    this.port   = options.port || 8087;
    this.parser = options.parser || function () {};
    this.auth   = options.auth || function () {};
    this.appender = options.appender || function() {};
    this.onParseError = options.onParseError || function () {};
    this.onAuthError = options.onAuthError || function () {};
    this.server = null;
};

/**
 * Starts UDP server
 *
 * @param {Function} clb
 */
UdpServer.prototype.start = function start(clb) {
    if (this.server !== null) {
        return;
    }
    clb = clb || function () {};

    this.server = dgram.createSocket('udp4');
    this.server.on("message", this.onMessage.bind(this));
    this.server.on("error", function(err) { clb(err); });
    this.server.on("listening", function() { clb(); });
    this.server.bind(this.port);
};

/**
 * Callback, registered to socket "message" event
 *
 * @param {Buffer} message
 */
UdpServer.prototype.onMessage = function onMessage(message) {

    var chunks = message.toString().split("\n");
    if (chunks.length < 4) {
        this.onParseError();
        return;
    }

    // Chunks
    var payload = chunks.slice(3).join("\n").trim();

    // Building EOS key
    var key;
    try {
        key = this.parser(chunks[2]);
    } catch (e) {
        this.onParseError();
        return;
    }

    // Authenticate
    if (!this.auth(key.realm, chunks[0], payload, chunks[1])) {
        this.onAuthError();
        return;
    }

    // Deliver in next tick
    setImmediate(this.appender, key, payload);
};

module.exports = UdpServer;