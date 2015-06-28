"use strict";

// Key parsing regex
var EosKeyRegex = /^([a-z0-9\\-_]*)\+([a-z\-]*):\/\/(.+)/;

// Known schemes list
var Schemes = {
    log: true
};

/**
 * EosKey
 *
 * @param {string}   realm
 * @param {string}   scheme
 * @param {string[]} tags
 * @constructor
 */
var EosKey = function EosKey(realm, scheme, tags)
{
    this.realm = realm;
    this.scheme = scheme;
    this.tags = tags.filter(function(x){ return typeof x === "string" && x.length > 0;}).sort();
};

/**
 * Returns string representation of EosKey
 *
 * @return {string}
 */
EosKey.prototype.toString = function toString()
{
    return this.realm + "+"+ this.scheme + "://" + this.tags.join(":");
};

/**
 * Returns string representation of EosKey without realm
 *
 * @return {string}
 */
EosKey.prototype.withoutRealm = function withoutRealm()
{
    return this.scheme + "://" + this.tags.join(":");
};

/**
 * Eos key parsing structure
 *
 * @param {string} string
 * @return {EosKey}
 * @throws {Error} On any parsing error
 * @constructor
 */
var Parser = function Parser(string) {
    if (typeof string !== "string") {
        throw "String expected";
    }

    if (!EosKeyRegex.test(string)) {
        throw "Provided string is not valid EosKey";
    }

    var chunks = EosKeyRegex.exec(string);

    if (Schemes[chunks[2]] !== true) {
        throw "Unsupported scheme " + chunks[2];
    }

    return new EosKey(chunks[1], chunks[2], chunks[3].split(":"));
};


module.exports = {
    EosKey: EosKey,
    Parser: Parser
};