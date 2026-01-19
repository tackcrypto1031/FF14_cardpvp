#!/bin/bash
# install.sh
echo "[1/3] Checking prerequisites..."
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 not found. Please install Python 3.8+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "Error: Node.js/npm not found. Please install Node.js 16+"
    exit 1
fi

echo "[2/3] Setting up environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

echo "[3/3] Running installation script..."
source venv/bin/activate
python3 scripts/install.py

if [ $? -ne 0 ]; then
    echo "Installation failed!"
    exit 1
fi

echo "Installation successful!"
