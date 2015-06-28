var EosKey = require("./../src/EosKey").EosKey;
var Parser = require("./../src/EosKey").Parser;

exports.testConstructor = function (test) {
    var key = new EosKey("foo", "bar", ["baz"]);

    test.strictEqual(key.realm, "foo");
    test.strictEqual(key.scheme, "bar");
    test.strictEqual(key.tags.length, 1);
    test.strictEqual(key.tags[0], "baz");

    test.done();
};

exports.testToString = function (test) {
    test.strictEqual(new EosKey("foo", "bar", ["baz"]).toString(), "foo+bar://baz");
    test.strictEqual(new EosKey("foo", "bar", ["baz"]).withoutRealm(), "bar://baz");
    test.strictEqual(new EosKey("foo", "bar", ["a", "b", "c"]) + "", "foo+bar://a:b:c");

    test.done();
};

exports.testArraySorting = function (test) {
    var key = new EosKey("foo", "bar", ["d", "a", "c", null, false, "b"]);

    test.equals(key.tags.length, 4);
    test.equals(key.tags[0], "a");
    test.equals(key.tags[1], "b");
    test.equals(key.tags[2], "c");
    test.equals(key.tags[3], "d");

    test.done();
};

exports.testParse = function (test) {

    var key = Parser("foo+log://b:a");
    test.equals(key.realm, "foo");
    test.equals(key.scheme, "log");
    test.equals(key.tags.length, 2);
    test.equals(key.tags[0], "a");
    test.equals(key.tags[1], "b");

    // Wrong syntax
    test.throws(function() { Parser("log://b:a"); });
    test.throws(function() { Parser("foo+log://"); });
    // Wrong scheme
    test.throws(function() { Parser("foo+bar://b:a"); });
    // Not string
    test.throws(function() { Parser(100); });

    test.done();
};