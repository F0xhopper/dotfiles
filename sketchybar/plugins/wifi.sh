#!/usr/bin/env bash
# Connected/disconnected only — no SSID, which avoids the Location Services
# permission prompt macOS added for reading network names.

if ifconfig en0 2>/dev/null | grep -q "status: active"; then
    sketchybar --set "$NAME" icon="󰖩" icon.color=0xffffffff
else
    sketchybar --set "$NAME" icon="󰖪" icon.color=0xff8a8a8e
fi
