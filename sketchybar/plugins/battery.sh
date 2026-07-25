#!/usr/bin/env bash
BATT=$(pmset -g batt)
PERCENT=$(echo "$BATT" | grep -Eo '[0-9]+%' | head -1 | tr -d '%')
CHARGING=$(echo "$BATT" | grep -c 'AC Power')

[ -z "$PERCENT" ] && exit 0

if [ "$CHARGING" -ne 0 ]; then
    ICON="󰂄"
    COLOR=0xffffffff
else
    case "$PERCENT" in
        100|9[0-9]|8[0-9]) ICON="󰁹"; COLOR=0xffffffff ;;
        7[0-9]|6[0-9])     ICON="󰂀"; COLOR=0xffffffff ;;
        5[0-9]|4[0-9])     ICON="󰁿"; COLOR=0xffffffff ;;
        3[0-9]|2[0-9])     ICON="󰁻"; COLOR=0xffffffff ;;
        *)                 ICON="󰁺"; COLOR=0xffff5f5f ;;
    esac
fi

sketchybar --set "$NAME" icon="$ICON" icon.color="$COLOR" label="${PERCENT}%"
