"use strict";

/**
 * Dispatcher object
 * Used to deliver message to all attached listeners
 * Works in synchronous mode
 *
 * @constructor
 */
var Dispatcher = function Dispatcher() {
    this.appenders = [];
};

/**
 * Registers new appender
 *
 * @param {Function} func
 */
Dispatcher.prototype.add = function add(func) {
    if (typeof func !== "function") {
        throw "Callable function expected";
    }

    this.remove(func);
    this.appenders.push(func);
};

/**
 * Removes registered appender
 *
 * @param {Function} func
 */
Dispatcher.prototype.remove = function remove(func) {
    if (typeof func !== "function") {
        throw "Callable function expected";
    }

    var io = this.appenders.indexOf(func);
    if (io >= 0) {
        this.appenders.splice(io, 1);
    }
};

/**
 * Sends message to registered appenders
 *
 * @param {EosKey} key
 * @param {string} payload
 */
Dispatcher.prototype.send = function send(key, payload) {
    for (var i = 0; i < this.appenders.length; i++) {
        this.appenders[i](key, payload);
    }
};


module.exports = Dispatcher;