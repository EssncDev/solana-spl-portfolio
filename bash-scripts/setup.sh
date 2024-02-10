#!/bin/bash

# Check if the script is being run as root
if [[ $EUID -ne 0 ]]; then
    echo "This script must be run as root" 
    exit 1
fi

# Update package index and install essential packages
apt update
apt install -y curl gnupg2

# Add the Node.js repository and install Node.js
curl -sL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Redis CLI
apt install -y redis-tools

# Print installation completion message
echo "Node.js and Redis CLI have been successfully installed."

# Check Node.js and Redis CLI versions
echo "Node.js version:"
node -v
echo "Redis CLI version:"
redis-cli --version

# download pm2
npm i -g pm2 
