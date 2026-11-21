// nav: ctrl+h/j/k/l moves between panes, vim-style, without stealing the keys
// from programs that need them. Draws nothing; it lives in the eden layout as
// an empty floating block so keys.json's "nav.<direction>" reach it.
//
//   - Neovim/Vim focused: the key goes to the editor, which moves between its
//     own splits and, at an edge, calls `herdr-app do pane.go` itself
//     (dotfiles nvim/after/plugin/herdr-nav.lua).
//   - Anything else: move to the pane that way. If there is none (a lone or
//     zoomed pane), the program gets the key, so ctrl+l still clears a shell.
//
// "nav.files" / "nav.changes" toggle the right-hand Files and Changes panels.
// It also keeps the Dock badge at the number of agents waiting on you.
import { View, div } from "gpui-kit";
import { nextCommand, focused, panes, agents, layout, run, hc, setBadge, checking } from "herdr";

const KEY = { left: "ctrl+h", down: "ctrl+j", up: "ctrl+k", right: "ctrl+l" };
const EDITORS = new Set(["nvim", "vim"]);
const PANELS = new Set(["files", "changes"]);
const find = (node, id) => {
  if (!node || typeof node !== "object") return null;
  if (node.id === id) return node;
  for (const child of node.children ?? []) {
    const hit = find(child, id);
    if (hit) return hit;
  }
  return null;
};

export default class Nav extends View {
  init(_props, cx) {
    this.badge = null;
    if (checking()) return;
    cx.spawn(async (cx) => {
      for (;;) {
        const command = await nextCommand();
        try {
          if (KEY[command]) await this.go(command);
          else if (PANELS.has(command)) this.panel(command);
        } catch (e) {
          console.log("nav:", String(e));
        }
      }
    });
  }

  async go(dir) {
    const before = focused();
    const terminal = before?.terminal;
    const pane = panes().find((p) => p.pane === before?.pane);
    if (terminal && pane && EDITORS.has(pane.program?.key)) {
      hc(["keys", terminal, KEY[dir]]);
      return;
    }
    run("pane.go", { direction: dir });
    if (!terminal) return;
    // The move lands after this script yields, so focus read straight away is
    // still the old pane. Wait a beat, then pass the key on only if nothing moved.
    // (Any awaited host call yields; `hc --version` is the cheapest one.)
    await hc(["--version"]);
    const after = focused();
    if (after?.pane === before.pane && after?.tab === before.tab) hc(["keys", terminal, KEY[dir]]);
  }

  panel(id) {
    const root = layout();
    const panel = find(root, "panel"),
      body = find(root, "panel-body");
    if (!panel || !body) return;
    if (!panel.hidden && body.active === id) {
      run("layout.hide", { id: "panel" });
      return;
    }
    run("layout.select", { stack: "panel-body", child: id });
    run("layout.show", { id: "panel" });
  }

  render() {
    const blocked = agents().filter((a) => a.status === "blocked").length;
    const text = blocked ? String(blocked) : null;
    if (text !== this.badge) {
      this.badge = text;
      setBadge(text);
    }
    return div();
  }
}
