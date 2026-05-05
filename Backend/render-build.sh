#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Install ffmpeg-static for cross-platform ffmpeg binary
echo "Installing ffmpeg-static..."
npm install ffmpeg-static fluent-ffmpeg --save

# Optional: if you wanted system ffmpeg (not recommended on Render)
# sudo apt-get update
# sudo apt-get install -y ffmpeg

# Start the backend server
echo "Starting backend..."
npm run start
