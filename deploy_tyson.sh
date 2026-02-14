#!/bin/bash

echo "Step 1: Creating TysonPlayer.wgt file..."
zip -r TysonPlayer.wgt * -x ".*" -x "__MACOSX" -x "*.zip"

echo "Waiting for 5 seconds..."
sleep 5

echo "Step 2: Packaging with Tizen..."
~/tizen-studio/tools/ide/bin/tizen package --type wgt --sign TysonProfile -- TysonPlayer.wgt

echo "Waiting for 5 seconds..."
sleep 10

echo "Step 3: Installing via SDB..."
sdb -s 192.168.31.124 install /Users/kausikjati/workspace/TysonPlayer/TysonPlayer.wgt

echo "Waiting for 5 seconds..."
sleep 5

echo "Step 4: Installing using Tizen CLI..."
~/tizen-studio/tools/ide/bin/tizen install -n TysonPlayer.wgt

echo "Process completed successfully!"

