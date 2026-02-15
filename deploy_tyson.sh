#!/bin/bash

# Tyson Player Deployment Script
# Update the TV IP address and profile name below

TV_IP="192.168.31.124"  # Change this to your TV's IP
PROFILE_NAME="TysonProfile"  # Change this to your certificate profile name

echo "========================================="
echo "Tyson Player - Deployment Script"
echo "========================================="
echo ""

echo "Step 1: Creating TysonPlayer.wgt file..."
zip -r TysonPlayer.wgt * -x ".*" -x "__MACOSX" -x "*.zip" -x "*.sh" -x "README.md"

if [ ! -f "TysonPlayer.wgt" ]; then
    echo "Error: Failed to create .wgt file"
    exit 1
fi

echo "✓ Package created"
echo ""

echo "Step 2: Signing with Tizen..."
tizen package --type wgt --sign $PROFILE_NAME -- TysonPlayer.wgt

if [ $? -ne 0 ]; then
    echo "Error: Failed to sign package"
    echo "Make sure you have created a certificate profile named '$PROFILE_NAME'"
    exit 1
fi

echo "✓ Package signed"
echo ""

echo "Step 3: Connecting to TV..."
sdb connect $TV_IP

if [ $? -ne 0 ]; then
    echo "Error: Failed to connect to TV at $TV_IP"
    echo "Make sure:"
    echo "  1. TV is on and in Developer Mode"
    echo "  2. IP address is correct"
    echo "  3. TV and computer are on same network"
    exit 1
fi

echo "✓ Connected to TV"
echo ""

echo "Step 4: Installing app on TV..."
sdb -s $TV_IP install TysonPlayer.wgt

if [ $? -ne 0 ]; then
    echo "Error: Failed to install app"
    exit 1
fi

echo "✓ App installed successfully!"
echo ""

echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo "Open 'Apps' on your TV to launch Tyson Player"
echo ""
