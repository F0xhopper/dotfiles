#!/bin/bash
# Set up Herdr on this machine from the dotfiles: link every config into place,
# install the pinned plugins, and wire up the one external dependency.
#
# Usage:
#   herdr/install.sh           link configs, install anything missing or off-pin
#   herdr/install.sh --freeze  rewrite plugins.txt commits from what is installed
#
# Safe to re-run. A real file already sitting where a link should go is moved
# aside to <name>.bak rather than overwritten.

set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(dirname "$HERE")"
PLUGINS_TXT="$HERE/plugins.txt"

installed_json() { herdr plugin list --json | jq -c '.result.plugins[]'; }

if [[ "${1:-}" == "--freeze" ]]; then
  tmp="$(mktemp)"
  while IFS= read -r line; do
    if [[ "$line" =~ ^([^#[:space:]]+)[[:space:]]+([0-9a-f]+)(.*)$ ]]; then
      repo="${BASH_REMATCH[1]}"
      commit="$(installed_json | jq -r --arg r "$repo" \
        'select((.source.owner + "/" + .source.repo) | ascii_downcase == ($r | ascii_downcase)) | .source.resolved_commit')"
      line="${line/${BASH_REMATCH[2]}/${commit:-${BASH_REMATCH[2]}}}"
    fi
    printf '%s\n' "$line"
  done < "$PLUGINS_TXT" > "$tmp"
  mv "$tmp" "$PLUGINS_TXT"
  git -C "$REPO" --no-pager diff --stat -- "$PLUGINS_TXT"
  exit 0
fi

link() { # link <source in repo> <target>
  mkdir -p "$(dirname "$2")"
  if [[ -e "$2" && ! -L "$2" ]]; then mv "$2" "$2.bak"; echo "moved aside: $2.bak"; fi
  ln -sfn "$1" "$2"
}

# --- dependencies -----------------------------------------------------------
command -v herdr >/dev/null || { echo "install herdr first: brew install herdr"; exit 1; }
command -v alerter >/dev/null || brew install vjeantet/tap/alerter

# --- plugins ----------------------------------------------------------------
# Installed before the configs are linked: radar writes its managed blocks into
# config.toml on first start, and the plugin config dirs only exist afterwards.
grep -vE '^\s*(#|$)' "$PLUGINS_TXT" | while read -r repo commit _; do
  have="$(installed_json | jq -r --arg r "$repo" \
    'select((.source.owner + "/" + .source.repo) | ascii_downcase == ($r | ascii_downcase)) | .source.resolved_commit')"
  if [[ "$have" == "$commit" ]]; then echo "ok        $repo"; continue; fi
  echo "install   $repo @ ${commit:0:7}"
  herdr plugin install "$repo" --ref "$commit" --yes >/dev/null
done

# --- configs ----------------------------------------------------------------
CFG="$HOME/.config/herdr"
link "$HERE/config.toml" "$CFG/config.toml"
for dir in "$HERE"/plugins/*/; do
  id="$(basename "$dir")"
  for f in "$dir"*; do link "$f" "$(herdr plugin config-dir "$id")/$(basename "$f")"; done
done
link "$HERE/automatic-rename/config.sh" "$HOME/.config/herdr-automatic-rename/config.sh"

# Keep herdr-radar's generated blocks out of commits (see .gitattributes).
git -C "$REPO" config filter.herdr-radar.clean "sed '/^# >>> herdr-radar/,/^# <<< herdr-radar/d'"
git -C "$REPO" config filter.herdr-radar.smudge cat

grep -q 'dotfiles/herdr/shell.zsh' "$HOME/.zshrc" 2>/dev/null \
  || echo 'source "$HOME/Projects/dotfiles/herdr/shell.zsh"' >> "$HOME/.zshrc"

herdr config check
herdr server reload-config >/dev/null 2>&1 || true
echo "done. Open a new shell for the tab-rename hook."
