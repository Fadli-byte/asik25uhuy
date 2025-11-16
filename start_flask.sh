#!/bin/bash
# Set LD_LIBRARY_PATH for OpenCV before starting Flask
# Find libstdc++ in nix store and add to LD_LIBRARY_PATH
if [ -z "$LD_LIBRARY_PATH" ]; then
    export LD_LIBRARY_PATH=""
fi

# Add common nix library paths
for lib_path in /nix/store/*/lib /nix/store/*/lib64; do
    if [ -d "$lib_path" ] && [ -f "$lib_path/libstdc++.so.6" ] 2>/dev/null; then
        export LD_LIBRARY_PATH="$lib_path:$LD_LIBRARY_PATH"
        break
    fi
done

# Also add gcc lib path if available
GCC_LIB=$(find /nix/store -name "libstdc++.so.6" -type f 2>/dev/null | head -1)
if [ -n "$GCC_LIB" ]; then
    GCC_LIB_DIR=$(dirname "$GCC_LIB")
    export LD_LIBRARY_PATH="$GCC_LIB_DIR:$LD_LIBRARY_PATH"
fi

# Add GLib library path (for libgthread)
GLIB_LIB=$(find /nix/store -name "libgthread-2.0.so.0" -type f 2>/dev/null | head -1)
if [ -n "$GLIB_LIB" ]; then
    GLIB_LIB_DIR=$(dirname "$GLIB_LIB")
    export LD_LIBRARY_PATH="$GLIB_LIB_DIR:$LD_LIBRARY_PATH"
fi

# Add all glib related libraries
for glib_lib in libglib-2.0.so.0 libgobject-2.0.so.0 libgmodule-2.0.so.0; do
    GLIB_PATH=$(find /nix/store -name "$glib_lib" -type f 2>/dev/null | head -1)
    if [ -n "$GLIB_PATH" ]; then
        GLIB_DIR=$(dirname "$GLIB_PATH")
        export LD_LIBRARY_PATH="$GLIB_DIR:$LD_LIBRARY_PATH"
    fi
done

# Use venv Python if available
if [ -f "venv/bin/python3" ]; then
    exec venv/bin/python3 app.py
else
    exec python3 app.py
fi

