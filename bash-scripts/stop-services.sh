#!/bin/bash

# Start PM2 services
echo "Stopping PM2 services..."

pm2 stop all 

echo "PM2 services stopped successfully."