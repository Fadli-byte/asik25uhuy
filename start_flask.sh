#!/bin/bash
# Set LD_LIBRARY_PATH for OpenCV before starting Flask
# Use minimal approach to avoid library conflicts

# Disable stack protection to prevent stack smashing errors
# (Safe in containerized environment)
export MALLOC_CHECK_=0
export MALLOC_PERTURB_=0

# Preserve existing LD_LIBRARY_PATH
if [ -z "$LD_LIBRARY_PATH" ]; then
    export LD_LIBRARY_PATH=""
fi

# Only add specific library paths that are actually needed
# Find libstdc++ (required by OpenCV)
STDCPP_LIB=$(find /nix/store -name "libstdc++.so.6" -type f 2>/dev/null | head -1)
if [ -n "$STDCPP_LIB" ]; then
    STDCPP_DIR=$(dirname "$STDCPP_LIB")
    export LD_LIBRARY_PATH="$STDCPP_DIR:$LD_LIBRARY_PATH"
fi

# Find GLib (required by OpenCV)
GLIB_LIB=$(find /nix/store -name "libgthread-2.0.so.0" -type f 2>/dev/null | head -1)
if [ -n "$GLIB_LIB" ]; then
    GLIB_DIR=$(dirname "$GLIB_LIB")
    export LD_LIBRARY_PATH="$GLIB_DIR:$LD_LIBRARY_PATH"
fi

# Use venv Python if available
if [ -f "venv/bin/python3" ]; then
    exec venv/bin/python3 app.py
else
    exec python3 app.py
fi

