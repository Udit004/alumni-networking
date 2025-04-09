#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install backend dependencies
cd backend
npm install

# Return to root folder (if needed for frontend build steps)
cd ..

# Output success message
echo "Build script completed successfully" 