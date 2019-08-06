# PM2 OHI
Stateless Nodejs OHI that reports PM2 metrics for managed applications.

## Installation
1. Download the release zip or `git clone` the repository
2. Unzip the release if that's what you're using
3. `cd` to the directory that contains `pm2ohi.js`
4. Run `npm install` to install the OHI into npm and download the dependencies
5. Copy the config, definition, and shell scripts to their locations: 
  - pm2-config.yml
    - OHI Configuration file, copy to: `/etc/newrelic-infra/integrations.d/`
    - No changes required
  - pm2-definition.yml
    - OHI Definition file, copy to: `/var/db/newrelic-infra/custom-integrations`
    - No changes required
  - run-pm2ohi.sh
    - Shell script Infra executes to run the OHI, copy to: `/var/db/newrelic-infra/custom-integrations`
    - Ensure `HOME` in the script contains the `.pm2` configuration directory
    - Ensure the `node` command has the full path to the `pm2ohi.js` script
6. Test your setup
  - Run `/var/db/newrelic-infra/custom-integrations/run-pm2ohi.sh`
  - If you do not see a big block of unformatted json  then the most likely issue is missing `.pm2` configuration. See [Debugging](#Debugging) below.
  - Once you are seeing the big block of unformatted json restart Infra
    - `sudo systemctl restart newrelic-infra`
    
## Configuration
- None, as such other than installation related

## Results
### Metrics
- Metrics are in Insights as `PM2MetricsSample` Events, `select * from PM2MetricsSample` will show them to you
### Inventory
- Under the RPM Infrastructure -> Inventory tab you'll find the PM2 Inventory as `integration/com.newrelic.pm2ohi/processSettings`

## Debugging
- If you're having trouble edit `/etc/newrelic-infra.yml` and enable debug logging to a file:
```yaml
verbose: 0
log_file: /tmp/infra.log
```
- `[PM2][Initialization] Environment variable HOME (Linux) or HOMEPATH (Windows) are not set!\n[PM2][Initialization] Defaulting to /etc/.pm2`
  - If you see this error the PM2 libraries the script uses cannot find the PM2 configuration files. That is, the files PM2 looks for when you run PM2 from the command line.
- You can always run the script from the command line to see its output:  `node pm2ohi.js`


