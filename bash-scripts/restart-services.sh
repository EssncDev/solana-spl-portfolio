#!/bin/bash

# Start PM2 services
echo "Restarting PM2 services..."

pm2 restart all 

echo "PM2 services restared successfully."