"use strict";

var log = require("sgwin").with("filter");


/**
 * Always returns true
 * Used for cases, when no filters applied
 *
 * @return {boolean}
 */
var AllowAll = function AllowAll() {
    return true;
};

/**
 * Returns function, that checks EosKey against particular key
 *
 * @param {string} tag
 * @return {Function}
 */
var SimpleTagFilter = function SimpleTagFilter(tag) {
    return function (key) {
        return key && key.tags.indexOf(tag) >= 0;
    }
};

/**
 * Returns filter for provided query
 *
 * @param {string} query
 * @return {Function}
 */
var getFilter = function getFilter(query) {
    if (!query) {
        // Empty query
        log.info("Empty filter function built");
        return AllowAll;
    } else {
        // Simple tag
        log.info("Filter for tag :name built", {name: query});
        return SimpleTagFilter(query);
    }
};


module.exports = getFilter;