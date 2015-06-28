"use strict";


// Includes
var chalk = require('chalk')
    , fs = require("fs")
    , Udp = require("./src/UdpServer")
    , Parser = require("./src/EosKey").Parser
    , Auth = require("./src/Authenticator")
    , Dispatcher = require("./src/Dispatcher")
    , HttpServer = require("./src/HttpServer");

// Cli tools
var cliSignature = "\n " + chalk.yellow.bold("EOS") + " " + chalk.yellow("realtime logging server") + "\n";
var cliProgress = function (message) {console.log("  ■  " + message);};
var cliSuccess = function (message) {console.log("  " + chalk.green.bold("■") + "  " + chalk.green(message));};
var cliFail = function (message) {console.log("  " + chalk.red.bold("✖") + "  " + chalk.red(message))};

var args = process.argv;


if (args.indexOf("-h") >= 0 || args.indexOf("--help") >= 0 || args.length < 3) {
    // Help information
    console.log(cliSignature);
    console.log(
        " usage: " + chalk.green("node server.js") + " " + chalk.cyan("<config.json>")
    );
    console.log(" inspect config.dist.json for common configuation patterns");
    console.log("");

    process.exit(1);
}


// Reading configuration
console.log(cliSignature);
cliProgress("Reading configuration file " + chalk.green(args[2]));
fs.readFile(args[2], function (err, done) {
    if (err) {
        cliFail("Unable to read config file");
        cliFail(err);
        process.exit(2)
    } else {
        var cnf = JSON.parse(done);
        cliSuccess("Config file read");
        startEos(cnf);
    }
});

function startEos(config) {
    // Instances
    var dispatcher = new Dispatcher();
    var auth = new Auth();

    for (var realm in config.realms) {
        if (config.realms.hasOwnProperty(realm)) {
            auth.add(realm, config.realms[realm]);
            cliProgress("Added reaml " + chalk.green(realm))
        }
    }
    cliProgress("Authenticator configured");

    var udp = new Udp(
        {
            port: config.udp.port,
            parser: Parser,
            auth: auth.isValid.bind(auth),
            appender: dispatcher.send.bind(dispatcher)
        }
    );

    var http = new HttpServer(
        {
            port: config.http.port,
            auth: auth.isValid.bind(auth),
            dispatcher: dispatcher
        }
    );

    // Start
    cliProgress("Starting UDP server on port " + chalk.cyan(config.udp.port));
    udp.start(function (err) {
        if (err) {
            cliFail("Unable to listen UDP on port " + config.udp.port);
            process.exit(5);
        } else {
            cliSuccess("Udp server is listening on " + config.udp.port);
        }
    });
    cliProgress("Starting HTTP server on port " + chalk.cyan(config.http.port));
    http.start(function (err) {
        if (err) {
            cliFail("Unable to listen HTTP on port " + config.http.port);
            process.exit(5);
        } else {
            cliSuccess("Http server is listening on " + config.http.port);
        }
    });
}
