#!/usr/bin/env bash
# Highlights the focused workspace and shows an icon for each open app,
# via the sketchybar-app-font ligature map (kvndrsslr/sketchybar-app-font).
# $1 is the workspace name.

source "$CONFIG_DIR/plugins/icon_map.sh"

# On first load the event vars aren't set, so fall back to querying AeroSpace.
FOCUSED_WORKSPACE=${FOCUSED_WORKSPACE:-$(aerospace list-workspaces --focused)}

icons=""
while IFS= read -r app; do
    [ -z "$app" ] && continue
    __icon_map "$app"
    icons+="$icon_result "
done <<< "$(aerospace list-windows --workspace "$1" --format "%{app-name}" | sort -u)"

[ "$1" = "$FOCUSED_WORKSPACE" ] && bg=on || bg=off
sketchybar --set "$NAME" background.drawing=$bg label="${icons% }"
