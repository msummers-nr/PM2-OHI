#!/bin/bash
# Place this file in /var/db/newrelic-infra/custom-integrations
# PM2 looks for its configuration based on $HOME where it expects to find a .pm2 folder, set this appropriately for your installation
# Ensure node has the fully qualified path to the .js file
HOME=/home/ubuntu bash -c ' node /home/ubuntu/PM2-OHI/pm2ohi.js'
