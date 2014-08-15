var mysql   = require("mysql"),
    winston = require("winston"),
    config  = require("../config/config.json");

var query = {
    status: "SHOW STATUS LIKE 'wsrep_local_state';",
    read_only: "SHOW GLOBAL VARIABLES LIKE 'read_only';"
};

function checkMysql (cb)
{
    var mysql_con = mysql.createConnection(config.mysql);

    mysql_con.connect();

    mysql_con.query({sql: query.status, timeout: config.timeout}, function (err, rows, fields) {
        if (!err)
        {
            var state = rows[0].wsrep_local_state;
            if (state === 4 || (state === 2 && config.available_when_donor))
            {
                if (!config.available_when_readonly)
                {
                    mysql_con.query({sql: query.read_only, timeout: config.timeout}, function (err2, rows2, fields2) {
                        if (!err2)
                        {
                            if (rows2[0].read_only === "OFF")
                            {
                                mysql_con.end();
                                cb(null, true);
                            } else {
                                winston.warn("Failure while retrieving status: Node is in read-only mode.");
                                mysql_con.end();
                                cb("Percona XtraDB Cluster Node is read-only.", false);
                            }
                        } else {
                            winston.warn("Failure while retrieving status: " + JSON.stringify(err));
                            mysql_con.end();
                            cb("Percona XtraDB Cluster Node is not synced.", false);
                        }
                    });
                } else {
                    mysql_con.end();
                    cb(null, true);
                }
            } else {
                winston.warn("Failure while retrieving status: Node is not synced.");
                mysql_con.end();
                cb("Percona XtraDB Cluster Node is not synced.", false);
            }
        } else {
            winston.warn("Failure while retrieving status: " + JSON.stringify(err));
            mysql_con.end();
            cb("Percona XtraDB Cluster Node is not synced.", false);
        }
    });
}

module.exports = checkMysql;