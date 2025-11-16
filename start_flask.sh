#!/bin/bash
# Set LD_LIBRARY_PATH for OpenCV before starting Flask
export LD_LIBRARY_PATH="/nix/store/*/lib:/nix/store/*/lib64:$LD_LIBRARY_PATH"

# Use venv Python if available
if [ -f "venv/bin/python3" ]; then
    exec venv/bin/python3 app.py
else
    exec python3 app.py
fi

