# Herdr app

Config for the [Herdr](https://herdr.dev) desktop app: one layout (`eden`), a
greyscale theme (`mono`), and the mods that draw them. The terminal Herdr
(`herdr`, the TUI) is configured separately in [`../herdr`](../herdr).

```sh
herdr-app/install.sh          # copy config/ into ~/.config/herdr-app
herdr-app/install.sh --pull   # bring edits made in the app's home back here
```

`config/` mirrors `~/.config/herdr-app`, holding only the files that are mine.
Everything else in that folder (shipped mods and layouts, `frame/`, `icons/`,
`data/`, `*.d.ts`, `AGENTS.md`, window and view state) is written by the app
and is not tracked.

These are copies rather than symlinks because the app hot-reloads only real
files inside its home, and rewrites `settings.json` itself. Edit in
`~/.config/herdr-app`, where changes apply live, then `--pull` and commit.

## What is here

| Path | What it is |
|---|---|
| `config/settings.json` | Fonts, zoom, sounds, telemetry off. Also written by the app's Settings screen. |
| `config/keys.json` | Every shortcut. Grouped app, spaces, tabs, panes, agents, layout. |
| `config/layouts/eden.json` | The window: sidebar, tab bar, pane cards with headers, status bar. `eden.svg` is its picture in Settings. |
| `config/themes/mono.json` | Greyscale chrome; agent status is told by shape and weight, not colour. The terminal's 16 colours stay Kanso's. |
| `config/themes/kanso.json` | The same palette with Kanso Zen colours, to match Ghostty and Neovim. Pick it from Settings. |
| `config/mods/mono-side` | Sidebar: spaces, then agents sorted pinned, blocked, done, working, idle. |
| `config/mods/mono-tabs` | Tab bar: drag to reorder, double-click to rename, right-click for the menu. |
| `config/mods/mono-pane` | Pane header: program, folder, branch, status; split, zoom and close on the focused pane. |
| `config/mods/mono-status` | Status bar: machine, space, branch, agent counts, Files and Changes toggles. |
| `config/mods/nav` | Invisible. Handles `ctrl+h/j/k/l` and the panel toggles, and sets the Dock badge to the number of blocked agents. |
| `config/mods/live-ports` | Listening ports per space, in the status bar. By VladTemp27, from [herdr-mods](https://github.com/VladTemp27/herdr-mods), Apache-2.0. |
| `config/mods/markdown-panel` | Markdown viewer and editor. By jlopezlira ([herdr-kanso](https://github.com/jlopezlira/herdr-kanso)) with Johannes Hund's [herdr-md-review](https://github.com/h0ru5/herdr-md-review) changes, Apache-2.0. |

The two gallery mods are vendored as installed, unformatted, so they can be
diffed against upstream. The `mono-*` mods borrow their icons from the shipped
`pane` and `workspace-chrome` mods (`mods/pane/*.svg`,
`mods/workspace-chrome/*.svg`); if an app update drops one, an icon goes blank
and that path is where to look.

## Keys that differ from the app's defaults

| Key | Does |
|---|---|
| `ctrl+h/j/k/l` | Move between panes. In Neovim the key goes to the editor first; with no pane that way, the program gets it (so `ctrl+l` still clears a lone shell). |
| `cmd+shift+h/j/k/l` | Swap the focused pane that way. |
| `cmd+shift+e` / `cmd+shift+g` | Toggle the Files / Changes panel. |
| `cmd+shift+m` | Markdown panel. |
| `cmd+ctrl+l` | Next layout (moved off `cmd+shift+l`). |
| `cmd+h`, `cmd+alt+h` | Unbound, so the window is never hidden by accident. |

`ctrl+h/j/k/l` needs the Neovim side too:
[`../nvim/after/plugin/herdr-nav.lua`](../nvim/after/plugin/herdr-nav.lua)
hands the move back to the app at the edge of Neovim's splits.

## Working on it

- After any edit: `herdr-app status` (its `errors` should be empty) and, for a
  mod, `herdr-app check ~/.config/herdr-app/mods/<name>`.
- An invalid `keys.json`, `settings.json` or layout is ignored and the reason
  written next to it as `<name>.error`.
- `ctrl+alt+shift+escape` always gets back to the default layout and keys.
- The `mono-*` and `nav` mods are formatted with Prettier
  (`npx prettier --write "herdr-app/config/mods/{mono-*,nav}/*.js"`).
- The app's full manual for all of this is `~/.config/herdr-app/AGENTS.md`.
