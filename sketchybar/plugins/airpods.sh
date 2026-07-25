#!/usr/bin/env bash
# Shows an icon only when AirPods are connected; hides the item otherwise.

if blueutil --connected | grep -qi "airpods"; then
    sketchybar --set "$NAME" drawing=on icon="󰋋" icon.color=0xffffffff
else
    sketchybar --set "$NAME" drawing=off
fi
