var Auth = require("./../src/Authenticator");

exports.testIsKnown = function(test) {
    var a = new Auth();

    a.add("foo", "abc");
    a.add("bar", "zzz");

    test.strictEqual(a.isKnown("foo"), true);
    test.strictEqual(a.isKnown("bar"), true);
    test.strictEqual(a.isKnown("baz"), false);

    test.done();
};

exports.testIsValid = function (test) {
    var a = new Auth();

    a.add("xxx", "zzz"); // Invalid secret

    test.strictEqual(
        a.isValid(
            "xxx",
            "1435350582.05652047910994",
            '{"message":"notice","level":"notice","eos-id":"558db6360dc31772763"}',
            "37df1731db9c646a263973d20f0f741bfad0cd89ec8953f347b649613542128b"
        ),
        false
    );

    a.add("xxx", "yyy");

    test.strictEqual(
        a.isValid(
            "xxx",
            "1435350582.05652047910994",
            '{"message":"notice","level":"notice","eos-id":"558db6360dc31772763"}',
            "37df1731db9c646a263973d20f0f741bfad0cd89ec8953f347b649613542128b"
        ),
        true
    );
    test.strictEqual(
        a.isValid(
            "wrongrealm",
            "1435350582.05652047910994",
            '{"message":"notice","level":"notice","eos-id":"558db6360dc31772763"}',
            "37df1731db9c646a263973d20f0f741bfad0cd89ec8953f347b649613542128b"
        ),
        false
    );

    test.done();
};

/*
 1435350582.05652047910994
 37df1731db9c646a263973d20f0f741bfad0cd89ec8953f347b649613542128b
 xxx+log://notice:demomode:MacBook-Pro-Anton.local
 {"message":"notice","level":"notice","eos-id":"558db6360dc31772763"}1435350582.0578964674694

 */