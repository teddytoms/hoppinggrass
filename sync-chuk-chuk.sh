#!/bin/sh
# Copy only the files Chuk Chuk needs to run into this site.
# The game's own project (drawings, design notes, tests) stays private.
set -e
SRC="${1:-$HOME/Code/chuk-chuk}"
DEST="$(dirname "$0")/chuk-chuk"
rm -rf "$DEST"
mkdir -p "$DEST"
cp "$SRC/index.html" "$DEST/"
cp -R "$SRC/css" "$SRC/js" "$DEST/"
echo "Copied Chuk Chuk from $SRC"
