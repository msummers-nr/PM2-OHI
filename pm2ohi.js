const pmx = require('pmx');
const pm2 = require('pm2');

// Version needs to be outside the config file
const ver = require('./package.json').version;
const guid = "com.newrelic.pm2ohi";
var duration = 30;
// Running restart
var restartList = {};

function bytesToMB(bytes, precision) {
    var kilobyte = 1024;
    var megabyte = kilobyte * 1024;
    return parseFloat((bytes / megabyte).toFixed(precision));
};

function secondsSince(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
    return seconds;
}

pmx.initModule({}, function (err, conf) {
    conf = conf.module_conf;

    pm2.connect(false, function (err) {
        if (err) {
            console.error('Error connecting to pm2', err);
            process.exit(1);
        }

        pm2.list(function (err, processes) {
            if (err) {
                console.error('Error listing to pm2 processes', err);
                process.exit(1);
            }

            var processCount = 0;
            var msg = {};
            msg.name = "com.newrelic.pm2";
            msg.protocol_version = "3";
            msg.integration_version = "1.0.0";

            var data = [];
            msg.data = data;
            processes.forEach(function (process) {
                data[processCount] = {};
                var entity = {};
                data[processCount].entity = entity;
                entity.name = process.name;
                entity.type = "com.newrelic.pm2.process";
                entity.id_attributes = [];
                var i = 0;
                entity.id_attributes[i++] = {"key": "pm_id", "value": process.pm_id};
                entity.id_attributes[i++] = {"key": "version", "value": process.pm2_env.version};
                entity.id_attributes[i++] = {"key": "execMode", "value": process.pm2_env.exec_mode};
                entity.id_attributes[i++] = {"key": "user", "value": process.pm2_env.username};

                var inventory = {}
                data[processCount].inventory = inventory;
                var processSettings = {};
                 processSettings["name"] = process.name;
                 processSettings["autorestart"] = process.pm2_env.autorestart;
                 processSettings["execMode"] = process.pm2_env.exec_mode;
                 processSettings["execInterpreter"] = process.pm2_env.exec_interpreter;
                 processSettings["execPath"] = process.pm2_env.pm_exec_path;
                 processSettings["pmCWD"] = process.pm2_env.pm_cwd;
                 processSettings["instances"] = process.pm2_env.instances;
                 //processSettings["nodeArgs"] = process.pm2_env.node_args;
                 processSettings["pmOutLogPath"] = process.pm2_env.pm_out_log_path;
                 processSettings["pmErrLogPath"] = process.pm2_env.pm_err_log_path;
                 processSettings["pmPidPath"] = process.pm2_env.pm_pid_path;
                 processSettings["vizionRunning"] = process.pm2_env.vizion_running;
                 processSettings["createdAt"] = process.pm2_env.created_at;
                 processSettings["pmID"] = process.pm2_env.pm_id;
                 processSettings["startedInside"] = process.pm2_env.started_inside;
                 //processSettings["command"] = process.pm2_env.command;
                 //processSettings["versioning"] = process.pm2_env.versioning;
                 processSettings["version"] =process.pm2_env.version;
                 processSettings["username"] =process.pm2_env.username;
                 inventory["processSettings"] = processSettings;


                var events = []
                data[processCount].events = events;

                var metrics = [];
                data[processCount].metrics = metrics;
                metrics[0] = {}

                // Get the metrics
                metrics[0]["eventType"] = "PM2MetricsSample";
                metrics[0]["entity_name"] = entity.type + ":" + entity.name;
                metrics[0]["processUptimeSeconds"] = secondsSince(process.pm2_env.pm_uptime);
                metrics[0]["processInstances"] = process.pm2_env.instances
                metrics[0]["processStatus"] = process.pm2_env.status
                metrics[0]["processUnstableRestarts"] = process.pm2_env.unstable_restarts
                metrics[0]["processTotalRestarts"] = process.pm2_env.restart_time;
                metrics[0]["processCpuPercent"] = process.monit.cpu;
                metrics[0]["processMemoryMB"] = bytesToMB(process.monit.memory, 1);
                processCount++;
            });
            var msgString = JSON.stringify(msg);
            process.stdout.write(msgString, () => {
                console.error("Flushed");
                process.exit(0);
            });
        });
    });
})
