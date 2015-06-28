"use strict";

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
        return AllowAll;
    } else {
        // Simple tag
        return SimpleTagFilter(query);
    }
};


module.exports = getFilter;