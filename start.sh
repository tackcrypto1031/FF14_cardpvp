#!/bin/bash
# start.sh
if [ ! -d "venv" ]; then
    echo "Error: Environment not set up. Please run ./install.sh first."
    exit 1
fi

source venv/bin/activate
python3 scripts/start.py
