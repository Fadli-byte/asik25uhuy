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
# Aggressive search: find all possible locations
echo "🔍 Searching for libstdc++.so.6..."

# Method 1: Find stdenv.cc.cc.lib directory
STDENV_LIB_DIR=$(find /nix/store -type d -name "stdenv.cc.cc.lib-*" 2>/dev/null | head -1)
if [ -n "$STDENV_LIB_DIR" ] && [ -d "$STDENV_LIB_DIR/lib" ]; then
    export LD_LIBRARY_PATH="$STDENV_LIB_DIR/lib:$LD_LIBRARY_PATH"
    echo "✅ Added stdenv.cc.cc.lib path: $STDENV_LIB_DIR/lib"
fi

# Method 2: Find libstdc++.so.6 directly (all instances)
STDCPP_PATHS=$(find /nix/store -name "libstdc++.so.6" -type f 2>/dev/null)
if [ -n "$STDCPP_PATHS" ]; then
    for STDCPP_LIB in $STDCPP_PATHS; do
        STDCPP_DIR=$(dirname "$STDCPP_LIB")
        if [[ ":$LD_LIBRARY_PATH:" != *":$STDCPP_DIR:"* ]]; then
            export LD_LIBRARY_PATH="$STDCPP_DIR:$LD_LIBRARY_PATH"
            echo "✅ Found libstdc++ at: $STDCPP_DIR"
        fi
    done
fi

# Method 3: Find all gcc lib directories and add them
if [ -z "$STDCPP_PATHS" ]; then
    echo "⚠️ libstdc++.so.6 not found directly, searching for GCC directories..."
    for GCC_DIR in $(find /nix/store -type d \( -path "*/gcc-*/lib" -o -path "*/gcc-wrapper-*/lib" \) 2>/dev/null); do
        if [ -d "$GCC_DIR" ] && [[ ":$LD_LIBRARY_PATH:" != *":$GCC_DIR:"* ]]; then
            export LD_LIBRARY_PATH="$GCC_DIR:$LD_LIBRARY_PATH"
            echo "✅ Added GCC lib directory: $GCC_DIR"
        fi
    done
fi

# Method 4: Find all directories containing libstdc++ (broader search)
if [ -z "$STDCPP_PATHS" ]; then
    for LIB_DIR in $(find /nix/store -type d -name "lib" 2>/dev/null | head -20); do
        if [ -f "$LIB_DIR/libstdc++.so.6" ] && [[ ":$LD_LIBRARY_PATH:" != *":$LIB_DIR:"* ]]; then
            export LD_LIBRARY_PATH="$LIB_DIR:$LD_LIBRARY_PATH"
            echo "✅ Found libstdc++ in: $LIB_DIR"
        fi
    done
fi

# Method 5: Use nix profile paths if available
if [ -d "$HOME/.nix-profile/lib" ]; then
    if [[ ":$LD_LIBRARY_PATH:" != *":$HOME/.nix-profile/lib:"* ]]; then
        export LD_LIBRARY_PATH="$HOME/.nix-profile/lib:$LD_LIBRARY_PATH"
        echo "✅ Added nix profile lib: $HOME/.nix-profile/lib"
    fi
fi
if [ -d "/root/.nix-profile/lib" ]; then
    if [[ ":$LD_LIBRARY_PATH:" != *":/root/.nix-profile/lib:"* ]]; then
        export LD_LIBRARY_PATH="/root/.nix-profile/lib:$LD_LIBRARY_PATH"
        echo "✅ Added root nix profile lib: /root/.nix-profile/lib"
    fi
fi

# Find GLib libraries (required by OpenCV)
echo "🔍 Searching for GLib libraries..."
GLIB_LIBS=(
    "libgthread-2.0.so.0"
    "libglib-2.0.so.0"
    "libgobject-2.0.so.0"
    "libgmodule-2.0.so.0"
)

for GLIB_LIB_NAME in "${GLIB_LIBS[@]}"; do
    GLIB_LIB=$(find /nix/store -name "$GLIB_LIB_NAME" -type f 2>/dev/null | head -1)
    if [ -n "$GLIB_LIB" ]; then
        GLIB_DIR=$(dirname "$GLIB_LIB")
        if [[ ":$LD_LIBRARY_PATH:" != *":$GLIB_DIR:"* ]]; then
            export LD_LIBRARY_PATH="$GLIB_DIR:$LD_LIBRARY_PATH"
            echo "✅ Found $GLIB_LIB_NAME at: $GLIB_DIR"
        fi
    fi
done

# Also search for glib package directory
GLIB_PKG_DIR=$(find /nix/store -type d -name "glib-*" 2>/dev/null | head -1)
if [ -n "$GLIB_PKG_DIR" ] && [ -d "$GLIB_PKG_DIR/lib" ]; then
    if [[ ":$LD_LIBRARY_PATH:" != *":$GLIB_PKG_DIR/lib:"* ]]; then
        export LD_LIBRARY_PATH="$GLIB_PKG_DIR/lib:$LD_LIBRARY_PATH"
        echo "✅ Added GLib package lib: $GLIB_PKG_DIR/lib"
    fi
fi

# Search in all lib directories for GLib
if [ -z "$GLIB_LIB" ]; then
    for LIB_DIR in $(find /nix/store -type d -name "lib" 2>/dev/null | head -30); do
        if [ -f "$LIB_DIR/libgthread-2.0.so.0" ] && [[ ":$LD_LIBRARY_PATH:" != *":$LIB_DIR:"* ]]; then
            export LD_LIBRARY_PATH="$LIB_DIR:$LD_LIBRARY_PATH"
            echo "✅ Found GLib in: $LIB_DIR"
        fi
    done
fi

# Debug: Print LD_LIBRARY_PATH
echo "📚 LD_LIBRARY_PATH: $LD_LIBRARY_PATH"

# Use venv Python if available
if [ -f "venv/bin/python3" ]; then
    exec venv/bin/python3 app.py
else
    exec python3 app.py
fi

