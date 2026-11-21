#!/bin/bash
# Sync the Herdr desktop app's config between the dotfiles and the app's home.
#
# Usage:
#   herdr-app/install.sh         copy config/ into ~/.config/herdr-app
#   herdr-app/install.sh --pull  copy the live versions of the tracked files
#                                back into config/, then `git diff` to review
#
# Copies, not symlinks, unlike the rest of these dotfiles: the app only
# hot-reloads real files inside its home (a symlinked mod loads once and then
# ignores edits), and it rewrites settings.json itself from the Settings
# screen. So the app's home stays the working copy and --pull brings edits
# back here.
#
# Safe to re-run. Installing never deletes anything from the app's home, and a
# file it would change is first kept under ~/.config/herdr-app.bak/<time>/.

set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="$HERE/config"
DEST="${HERDR_APP_HOME:-$HOME/.config/herdr-app}"

# Written by the app into every mod folder; never ours.
GENERATED=(--exclude gpui-kit.d.ts --exclude jsconfig.json --exclude .DS_Store)

if [[ "${1:-}" == "--pull" ]]; then
  [[ -d "$DEST" ]] || { echo "no app home at $DEST"; exit 1; }
  # Mods are pulled as whole folders, so files added or removed in one follow.
  for dir in "$SRC"/mods/*/; do
    name="$(basename "$dir")"
    [[ -d "$DEST/mods/$name" ]] || { echo "missing   mods/$name"; continue; }
    rsync -a --delete "${GENERATED[@]}" "$DEST/mods/$name/" "$dir"
  done
  # Everything else file by file: only what is already tracked here.
  (cd "$SRC" && find . -type f -not -path './mods/*' -not -name .DS_Store) | while read -r f; do
    if [[ -f "$DEST/$f" ]]; then cp -p "$DEST/$f" "$SRC/$f"; else echo "missing   ${f#./}"; fi
  done
  git -C "$HERE" --no-pager status --short -- "$SRC"
  exit 0
fi

[[ $# -eq 0 ]] || { echo "usage: $0 [--pull]"; exit 2; }

mkdir -p "$DEST"
backup="$DEST.bak/$(date +%Y%m%d-%H%M%S)"
# -c compares contents, so an identical file is neither copied nor backed up.
changes="$(rsync -rc --itemize-changes --backup --backup-dir="$backup" "${GENERATED[@]}" "$SRC/" "$DEST/")"
# Only the files actually sent; rsync also lists the ones it left alone.
grep '^>' <<<"$changes" || echo "already up to date"
[[ -d "$backup" ]] && echo "previous versions kept in $backup"

# --- verify -----------------------------------------------------------------
if ! command -v herdr-app >/dev/null; then
  echo "herdr-app is not on PATH; open Herdr once and it links itself into ~/.local/bin."
  exit 0
fi

status=0
for dir in "$SRC"/mods/*/; do
  name="$(basename "$dir")"
  herdr-app check "$DEST/mods/$name" >/dev/null 2>&1 || { echo "check failed: mods/$name"; status=1; }
done
# The app keeps the last good version of an invalid file and says why here.
for err in "$DEST"/*.error "$DEST"/layouts/*.error; do
  [[ -s "$err" ]] && { echo "$(basename "$err"): $(cat "$err")"; status=1; }
done

echo "done. First time on this machine: herdr-app do layout.switch --name eden"
exit $status
