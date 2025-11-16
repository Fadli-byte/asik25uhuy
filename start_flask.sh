#!/bin/bash
# Set LD_LIBRARY_PATH for OpenCV before starting Flask
# Collect all required library paths from nix store

# Initialize LD_LIBRARY_PATH
if [ -z "$LD_LIBRARY_PATH" ]; then
    export LD_LIBRARY_PATH=""
fi

# List of required libraries for OpenCV
REQUIRED_LIBS=(
    "libstdc++.so.6"
    "libgthread-2.0.so.0"
    "libglib-2.0.so.0"
    "libgobject-2.0.so.0"
    "libgmodule-2.0.so.0"
)

# Find and add library paths
for lib_name in "${REQUIRED_LIBS[@]}"; do
    LIB_PATH=$(find /nix/store -name "$lib_name" -type f 2>/dev/null | head -1)
    if [ -n "$LIB_PATH" ]; then
        LIB_DIR=$(dirname "$LIB_PATH")
        # Only add if not already in LD_LIBRARY_PATH
        if [[ ":$LD_LIBRARY_PATH:" != *":$LIB_DIR:"* ]]; then
            export LD_LIBRARY_PATH="$LIB_DIR:$LD_LIBRARY_PATH"
        fi
    fi
done

# Also add common library directories that might contain dependencies
for lib_dir in /nix/store/*/lib /nix/store/*/lib64; do
    if [ -d "$lib_dir" ] && [[ ":$LD_LIBRARY_PATH:" != *":$lib_dir:"* ]]; then
        # Check if directory contains any .so files (to avoid adding empty dirs)
        if [ -n "$(find "$lib_dir" -maxdepth 1 -name "*.so*" 2>/dev/null | head -1)" ]; then
            export LD_LIBRARY_PATH="$lib_dir:$LD_LIBRARY_PATH"
        fi
    fi
done

# Use venv Python if available
if [ -f "venv/bin/python3" ]; then
    exec venv/bin/python3 app.py
else
    exec python3 app.py
fi

