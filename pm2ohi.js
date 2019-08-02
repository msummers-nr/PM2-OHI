const pmx = require('pmx');
const pm2 = require('pm2');

// Version needs to be outside the config file
const ver = require('./package.json').version;
const guid = "com.newrelic.pm2ohi";
var duration = 30;
// Running restart
var restartList = {};

function bytesToMB (bytes, precision) {
    var kilobyte = 1024;
    var megabyte = kilobyte * 1024;
    return parseFloat((bytes / megabyte).toFixed(precision)) ;
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

            var msg = {};
            msg.name = "com.newrelic.pm2";
            msg.protocol_version = "2";
            msg.integration_version = "1.0.0";

            var data = [];
            msg.data = data;
            var processCount = 0;
            processes.forEach(function (process) {
                data[processCount] = {};
                var entity = {};
                data[processCount].entity = entity;
                entity.name = process.name;
                entity.type = "com.newrelic.pm2.process";
                entity.id_attributes = [];
                var i = 0;
                entity.id_attributes[i++] = {"pm_id": process.pm_id};
                entity.id_attributes[i++] = {"version": process.pm2_env.version};
                entity.id_attributes[i++] = {"execMode": process.pm2_env.exec_mode};
                entity.id_attributes[i++] = {"user": process.pm2_env.username};

                var inventory = {}
                data[processCount].inventory = inventory;
                inventory["name"] = process.name;
                inventory["autorestart"] = process.pm2_env.autorestart;
                inventory["execMode"] = process.pm2_env.exec_mode;
                inventory["execInterpreter"] = process.pm2_env.exec_interpreter;
                inventory["execPath"] = process.pm2_env.pm_exec_path;
                inventory["pmCWD"] = process.pm2_env.pm_cwd;
                inventory["instances"] = process.pm2_env.instances;
                inventory["nodeArgs"] = process.pm2_env.node_args;
                inventory["pmOutLogPath"] = process.pm2_env.pm_out_log_path;
                inventory["pmErrLogPath"] = process.pm2_env.pm_err_log_path;
                inventory["pmPidPath"] = process.pm2_env.pm_pid_path;
                inventory["vizionRunning"] = process.pm2_env.vizion_running;
                inventory["createdAt"] = process.pm2_env.created_at;
                inventory["pmID"] = process.pm2_env.pm_id;
                inventory["startedInside"] = process.pm2_env.started_inside;
                inventory["command"] = process.pm2_env.command;
                inventory["versioning"] = process.pm2_env.versioning;
                inventory["version"] =process.pm2_env.version;
                inventory["username"] =process.pm2_env.username;


                var events = []
                data[processCount].events = events;

                var metrics = [];
                data[processCount].metrics = metrics;
                metrics[0] = {}

                // Get the metrics
                metrics[0]["eventType"] = "PM2MetricsSample";
                metrics[0]["entity_name"] = entity.type + ":" + entity.name;
                metrics[0]["processUptimeSeconds"] = secondsSince(process.pm2_env.pm_uptime);
                metrics[0]["processInstances"]=process.pm2_env.instances
                metrics[0]["processStatus"]=process.pm2_env.status
                metrics[0]["processUnstableRestarts"]=process.pm2_env.unstable_restarts
                metrics[0]["processTotalRestarts"] = process.pm2_env.restart_time;
                metrics[0]["processCpuPercent"] = process.monit.cpu;
                metrics[0]["processMemoryMB"] = bytesToMB(process.monit.memory, 1);
            });
            var msgString = JSON.stringify(msg);
            console.log(msgString);
            process.exit();
        });
    });
})
