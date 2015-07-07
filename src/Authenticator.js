"use strict";

var crypto = require("crypto")
    , log = require("sgwin").with("auth");

/**
 * Authenticator, used to authorize connection and UDP packet
 * Also is realms holder
 *
 * @constructor
 */
var Authenticator = function Authenticator()
{
    this.realms = {};
};

/**
 * Registers new realm (or replaces existing)
 *
 * @param {string} realm
 * @param {string} secret
 */
Authenticator.prototype.add = function add(realm, secret) {
    this.realms[realm] = secret;
};

/**
 * Returns true if provided realm is registered
 *
 * @param {string} realm
 * @return {boolean}
 */
Authenticator.prototype.isKnown = function isKnown(realm) {
    return this.realms.hasOwnProperty(realm);
};

/**
 * Returns true, if incoming arguments are validated using hash
 *
 * @param {string} realm
 * @param {string} nonce
 * @param {string} payload
 * @param {string} hash
 * @return {boolean}
 */
Authenticator.prototype.isValid = function isValid(realm, nonce, payload, hash) {
    if (!this.isKnown(realm)) {
        log.warn("Realm :name not known", {name: realm});
        return false;
    }

    var result = (hash === this.sign(nonce, payload, this.realms[realm]));
    log.info("Check result for :realm :nonce is :res", {realm: realm, nonce: nonce, res: result});
    return result;
};

/**
 * Returns signature of packet with provided data
 *
 * @param {string} nonce
 * @param {string} payload
 * @param {string} secret
 */
Authenticator.prototype.sign = function sign(nonce, payload, secret) {
    var shasum = crypto.createHash("sha256");
    shasum.update(nonce + payload + secret);
    return shasum.digest("hex");
};

module.exports = Authenticator;