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

# Find and add libstdc++ (required by OpenCV)
# Try multiple search methods
STDCPP_LIB=""
if [ -z "$STDCPP_LIB" ]; then
    STDCPP_LIB=$(find /nix/store -name "libstdc++.so.6" -type f 2>/dev/null | head -1)
fi
if [ -z "$STDCPP_LIB" ]; then
    STDCPP_LIB=$(find /nix/store -path "*/gcc-*/lib/libstdc++.so.6" -type f 2>/dev/null | head -1)
fi
if [ -z "$STDCPP_LIB" ]; then
    STDCPP_LIB=$(find /nix/store -path "*/stdenv-*/lib/libstdc++.so.6" -type f 2>/dev/null | head -1)
fi

if [ -n "$STDCPP_LIB" ]; then
    STDCPP_DIR=$(dirname "$STDCPP_LIB")
    export LD_LIBRARY_PATH="$STDCPP_DIR:$LD_LIBRARY_PATH"
    echo "✅ Found libstdc++ at: $STDCPP_DIR"
else
    echo "⚠️ Warning: libstdc++.so.6 not found"
fi

# Find GLib (required by OpenCV)
GLIB_LIB=$(find /nix/store -name "libgthread-2.0.so.0" -type f 2>/dev/null | head -1)
if [ -n "$GLIB_LIB" ]; then
    GLIB_DIR=$(dirname "$GLIB_LIB")
    export LD_LIBRARY_PATH="$GLIB_DIR:$LD_LIBRARY_PATH"
    echo "✅ Found GLib at: $GLIB_DIR"
fi

# Debug: Print LD_LIBRARY_PATH
echo "📚 LD_LIBRARY_PATH: $LD_LIBRARY_PATH"

# Use venv Python if available
if [ -f "venv/bin/python3" ]; then
    exec venv/bin/python3 app.py
else
    exec python3 app.py
fi

