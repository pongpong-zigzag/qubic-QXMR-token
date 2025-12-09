#!/bin/bash

# QXMR Deployment Script
# This script builds and prepares the application for deployment

set -e

echo "=== QXMR Deployment Script ==="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root${NC}"
    exit 1
fi

# Navigate to website directory
cd /var/website

echo -e "${YELLOW}Step 1: Installing Python dependencies...${NC}"
cd backend
pip3 install -r requirements.txt
cd ..

echo -e "${YELLOW}Step 2: Installing Node.js dependencies...${NC}"
npm install

echo -e "${YELLOW}Step 3: Building frontend...${NC}"
npm run build

echo -e "${YELLOW}Step 4: Building admin...${NC}"
npm run build:admin

echo -e "${GREEN}Build completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Install SSL certificates in /etc/ssl/certs/ and /etc/ssl/private/"
echo "2. Update nginx configurations with correct SSL certificate paths"
echo "3. Test nginx configuration: nginx -t"
echo "4. Reload nginx: systemctl reload nginx"
echo "5. Start backend service: systemctl start qxmr-backend"
echo "6. Enable backend service: systemctl enable qxmr-backend"

