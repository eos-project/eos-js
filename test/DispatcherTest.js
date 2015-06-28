var Dispatcher = require("./../src/Dispatcher");

exports.testRegistration = function (test) {

    var f1 = function (){};
    var f2 = function (){};

    var d = new Dispatcher();
    d.add(f1);
    d.add(f1);
    d.add(f2);

    test.equals(d.appenders.length, 2);
    d.remove(f1);
    test.equals(d.appenders.length, 1);
    d.remove(f1);
    test.equals(d.appenders.length, 1);
    d.remove(f2);
    test.equals(d.appenders.length, 0);

    test.done();
};