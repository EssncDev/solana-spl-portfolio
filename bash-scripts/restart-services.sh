#!/bin/bash

# Start PM2 services
echo "Restarting PM2 services..."

pm2 restart ./services/redis/token-scraper.js
pm2 restart ./services/api/api.js
npm start 

echo "PM2 services restared successfully."