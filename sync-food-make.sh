#!/bin/sh
# Copy only the files Food Make needs to run into this site.
# The game's own project (drawings, design notes, tests) stays private.
set -e
SRC="${1:-$HOME/Code/food-make}"
DEST="$(dirname "$0")/food-make"
rm -rf "$DEST"
mkdir -p "$DEST"
cp "$SRC/index.html" "$DEST/"
cp -R "$SRC/css" "$SRC/js" "$DEST/"
echo "Copied Food Make from $SRC"
