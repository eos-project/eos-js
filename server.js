"use strict";

// Includes
var fs = require("fs")
    , Udp = require("./src/UdpServer")
    , Parser = require("./src/EosKey").Parser
    , Auth = require("./src/Authenticator")
    , Dispatcher = require("./src/Dispatcher")
    , HttpServer = require("./src/HttpServer")
    , Log = require('sgwin');

// Cli tools
var args = process.argv;

if (args.indexOf("-h") >= 0 || args.indexOf("--help") >= 0 || args.length < 3) {
    // Help information
    console.log("\n\n usage: node server.js <config.json>");
    console.log(" inspect config.dist.json for common configuration patterns");
    console.log("");

    process.exit(1);
}


// Reading configuration
var file = args[2];
Log.info("Reading configuration file :file", {file: file});
fs.readFile(args[2], function (err, done) {
    if (err) {
        Log.error("Unable to read config from :file", {file: file});
        Log.error(err);
        process.exit(2)
    } else {
        var cnf = JSON.parse(done);
        Log.success("Config loaded");
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
            Log.info("Added realm :realm", {realm: realm});
        }
    }
    Log.info("Authenticator configured");

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
    var udpReady = false;
    var httpReady = false;
    function onLoad() {
        if (udpReady && httpReady) {
            Log.success("EOS server ready to serve");
        }
    }
    Log.info("Starting UDP server on :port", {port: config.udp.port});
    udp.start(function (err) {
        if (err) {
            Log.error("Unable to listen UDP on :port", {port: config.udp.port});
            process.exit(5);
        } else {
            Log.success("Udp server is listening on :port", {port: config.udp.port});
            udpReady = true;
            onLoad();
        }
    });
    Log.info("Starting HTTP server on :port", {port: config.http.port});
    http.start(function (err) {
        if (err) {
            Log.error("Unable to listen HTTP on :port ", {port: config.http.port});
            process.exit(5);
        } else {
            Log.success("Http server is listening :port", {port: config.http.port});
            httpReady = true;
            onLoad();
        }
    });
}
