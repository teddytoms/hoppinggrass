#!/bin/sh
# Copy only the files The Big Adventure needs to run into this site.
# The game's own project (drawings, design notes, tests) stays private.
set -e
SRC="${1:-$HOME/Code/big-adventure}"
DEST="$(dirname "$0")/big-adventure"
rm -rf "$DEST"
mkdir -p "$DEST"
cp "$SRC/index.html" "$DEST/"
cp -R "$SRC/css" "$SRC/js" "$DEST/"
echo "Copied The Big Adventure from $SRC"
