var http        = require("http"),
    os          = require("os"),
    fs          = require("fs"),
    winston     = require("winston"),
    config      = require("../config/config.json"),
    checkMysql  = require("./checkMysql.js");

var query_count = 0;

if (!fs.existsSync(config.log_directory))
{
    fs.mkdirSync(config.log_directory);
}

winston.add(winston.transports.DailyRotateFile, {dirname: config.log_directory, json: false});

winston.info("Starting ProClustercheck...");

var responseCode = 200;
var serviceState = '';

var server = http.createServer(function (req, res) {
    if ( (config.server.checkIP && config.server.allowedIPs.indexOf(req.connection.remoteAddress) > -1 ) ||
        !config.server.checkIP)
    {
        res.writeHead(responseCode);
        res.end(serviceState);
    } else {
        winston.warn("Client was denied access. IP: " + req.connection.remoteAddress);
        res.writeHead(403);
        res.end("Access denied!");
    }
});

server.listen(config.server.port, config.server.host);

function runPoll () {
    checkMysql(function (error, available) {
        setTimeout(runPoll, config.check_delay);
        if (available) {
            responseCode = 200;
            serviceState = "Percona XtraDB Cluster Node is synced.";
        } else {
            responseCode = 503;
            serviceState = error;
        }
    });
}

setTimeout(runPoll, 0);

winston.info("ProClustercheck running on " + config.server.host + ":" + config.server.port);

process.stdin.on("data", function (data) {
    data = data.toString("UTF8");
    var cmd = data.split(os.EOL)[0];

    switch (cmd) {
        case "check":
        case "ping":
        case "test":
            if ( query_count === 0 || !config.single_query )
            {
                query_count++;
                checkMysql(function (error, available) {
                    query_count--;
                    if (available)
                    {
                        console.log("OK: Percona XtraDB Cluster Node is synced.");
                    } else {
                        console.log("FAIL: " + error);
                    }
                });
            } else {
                console.log("FAIL: Percona XtraDB Cluster Node is not synced.");
            }
        break;

        default:
        case "help":
            console.log("Available commands: check");
        break;
    }
});