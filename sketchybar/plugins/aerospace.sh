#!/usr/bin/env bash
# Highlights the focused workspace. $1 is the workspace name.

# On first load the event vars aren't set, so fall back to querying AeroSpace.
FOCUSED_WORKSPACE=${FOCUSED_WORKSPACE:-$(aerospace list-workspaces --focused)}

if [ "$1" = "$FOCUSED_WORKSPACE" ]; then
    sketchybar --set "$NAME" background.drawing=on label.color=0xffffffff
else
    sketchybar --set "$NAME" background.drawing=off label.color=0xff8a8a8e
fi
