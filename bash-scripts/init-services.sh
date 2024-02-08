#!/bin/bash

# Start PM2 services
echo "Starting PM2 services..."

pm2 start ./services/redis/token-scraper.js
pm2 start ./services/api/api.js
npm start

echo "PM2 services started successfully."