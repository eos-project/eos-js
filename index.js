"use strict";

var uuid = require("uuid")
    , Authenticator = require("./src/Authenticator")
    , EosKey = require("./src/EosKey").EosKey
    , dgram = require("dgram");

var auth = new Authenticator();

/**
 * @param {object} options
 * @constructor
 */
var EosClient = function EosClient(options) {
    options = options || {};

    this.host = options.host;
    this.port = options.port || 8087;
    this.realm = options.realm;
    this.secret = options.secret;
    this.tags = options.tags || [];
    this.id = options.id || uuid.v4();

    this.udp = null;
    this.free = null;
    this.timeout = 100;
    var self = this;
    this.onFree = function () {
        self.udp.close();
        self.udp = null;
    }
};

/**
 * Utility method, that provided auto-closable UDP client
 *
 * @return {Socket}
 */
EosClient.prototype.getUdpSender = function getUdpSender() {
    if (this.udp === null) {
        this.udp = dgram.createSocket('udp4');
        this.free = setTimeout(this.onFree, this.timeout);
    } else {
        // Shift timeout
        clearTimeout(this.free);
        this.free = setTimeout(this.onFree, this.timeout);
    }

    return this.udp;
};

/**
 * Sends data to EOS
 *
 * @param {string} message
 * @param {object} context
 */
EosClient.prototype.send = function send(message, context) {
    // Tags list
    var tags = this.tags;

    // Build packet
    var packet = {
        message: message || "Empty message"
    };
    packet["eos-id"] = this.id;

    // Copy context
    if (context && typeof context === "object") {
        for (var key in context) {
            if (key === "tags") {
                tags = tags.concat(typeof context.tags === "string" ? [context.tags] : context.tags);
            } else if (context.hasOwnProperty(key)) {
                packet[key] = typeof context[key] === "function" ? context[key]() : context[key];
            }
        }
    }

    // Generating nonce, signature and key
    var nonce = (new Date()).getTime() + "" + Math.random();
    var payload = JSON.stringify(packet);
    var signature = auth.sign(nonce, payload, this.secret);
    var eoskey = new EosKey(this.realm, "log", tags);

    // Sending
    var buffer = new Buffer(nonce + "\n" + signature + "\n" + eoskey + "\n" + payload);
    this.getUdpSender().send(buffer, 0, buffer.length, this.port, this.host);
};

module.exports = EosClient;