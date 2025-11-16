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
# Try multiple search methods and add all found paths
STDCPP_PATHS=$(find /nix/store -name "libstdc++.so.6" -type f 2>/dev/null)
if [ -z "$STDCPP_PATHS" ]; then
    STDCPP_PATHS=$(find /nix/store -path "*/gcc-*/lib/libstdc++.so.6" -type f 2>/dev/null)
fi
if [ -z "$STDCPP_PATHS" ]; then
    STDCPP_PATHS=$(find /nix/store -path "*/stdenv.cc.cc.lib-*/lib/libstdc++.so.6" -type f 2>/dev/null)
fi

if [ -n "$STDCPP_PATHS" ]; then
    for STDCPP_LIB in $STDCPP_PATHS; do
        STDCPP_DIR=$(dirname "$STDCPP_LIB")
        if [[ ":$LD_LIBRARY_PATH:" != *":$STDCPP_DIR:"* ]]; then
            export LD_LIBRARY_PATH="$STDCPP_DIR:$LD_LIBRARY_PATH"
            echo "✅ Added libstdc++ path: $STDCPP_DIR"
        fi
    done
else
    echo "⚠️ Warning: libstdc++.so.6 not found, trying to add gcc lib directory"
    # Fallback: try to find gcc lib directory
    GCC_LIB_DIR=$(find /nix/store -type d -path "*/gcc-*/lib" 2>/dev/null | head -1)
    if [ -n "$GCC_LIB_DIR" ]; then
        export LD_LIBRARY_PATH="$GCC_LIB_DIR:$LD_LIBRARY_PATH"
        echo "✅ Added GCC lib directory: $GCC_LIB_DIR"
    fi
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

