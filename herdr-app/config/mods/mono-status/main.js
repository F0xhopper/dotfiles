// mono-status: the eden layout's bottom bar. Left: where you are (machine,
// space, branch) and what the agents are doing. Right: the Files and Changes
// panel toggles, settings, and the command palette key.
import { View, div, svg } from "gpui-kit";
import { h_flex } from "gpui-base";
import { spaces, agents, theme, run, layout, keys } from "herdr";

function find(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const hit = find(child, id);
    if (hit) return hit;
  }
  return null;
}
const SYMBOL = { cmd: "⌘", ctrl: "⌃", shift: "⇧", alt: "⌥", option: "⌥" };
const keyFor = (action) => {
  const b = keys().find((k) => k.section === "global" && k.action === action);
  return b
    ? b.keys
        .split("-")
        .map((p) => SYMBOL[p.toLowerCase()] ?? p.toUpperCase())
        .join("")
    : null;
};

export default class MonoStatus extends View {
  render() {
    const t = theme();
    const space = spaces().find((s) => s.active);
    const list = agents();
    const count = (s) => list.filter((a) => a.status === s).length;
    const blocked = count("blocked"),
      working = count("working"),
      done = count("done");
    const root = layout(),
      panel = find(root, "panel"),
      body = find(root, "panel-body");
    const item = (icon, text) =>
      h_flex()
        .flex_none()
        .gap(5)
        .items_center()
        .child(svg(`mods/workspace-chrome/${icon}.svg`).size(12))
        .child(text);
    const toggle = (id, icon, text) => {
      const on = panel && !panel.hidden && body?.active === id;
      return h_flex()
        .id(`panel-${id}`)
        .h(20)
        .px(7)
        .gap(5)
        .flex_none()
        .items_center()
        .rounded(4)
        .text_color(on ? t.foreground : t.muted)
        .when(on, (el) => el.bg(t.selected))
        .hover((s) => s.bg(t.hover).text_color(t.foreground))
        .on_click(() => {
          if (on) {
            run("layout.hide", { id: "panel" });
            return;
          }
          run("layout.select", { stack: "panel-body", child: id });
          run("layout.show", { id: "panel" });
        })
        .child(svg(`mods/workspace-chrome/${icon}.svg`).size(12))
        .child(text);
    };
    const palette = keyFor("app.palette");
    return h_flex()
      .size_full()
      .px(12)
      .gap(14)
      .items_center()
      .bg(t.chrome)
      .border_t(1)
      .border_color(t.border)
      .text_size(11.5)
      .text_color(t.muted)
      .child(item(space?.machine ? "server" : "monitor", space?.machine ?? "local"))
      .when(Boolean(space), (el) => el.child(item("folder", space.name)))
      .when(Boolean(space?.branch), (el) => el.child(item("git-branch", space.branch)))
      .child(div().w(1).h(12).bg(t.border))
      .when(list.length === 0, (el) => el.child(div().text_color(t.dim).child("no agents")))
      .when(blocked > 0, (el) =>
        el.child(
          h_flex()
            .gap(5)
            .items_center()
            .text_color(t.blocked)
            .font_semibold()
            .child(div().size(6).bg(t.blocked))
            .child(`${blocked} need${blocked === 1 ? "s" : ""} you`),
        ),
      )
      .when(working > 0, (el) =>
        el.child(
          h_flex()
            .gap(5)
            .items_center()
            .text_color(t.foreground)
            .child(svg("mods/workspace-chrome/spinner.svg").size(10).spin(1100))
            .child(`${working} working`),
        ),
      )
      .when(done > 0, (el) => el.child(div().child(`${done} done`)))
      .when(list.length > 0 && !blocked && !working && !done, (el) =>
        el.child(div().text_color(t.dim).child(`${list.length} idle`)),
      )
      .child(div().flex_1())
      .child(toggle("files", "files", "files"))
      .child(toggle("changes", "git-compare", "changes"))
      .child(
        h_flex()
          .id("settings")
          .h(20)
          .px(7)
          .flex_none()
          .items_center()
          .rounded(4)
          .hover((s) => s.bg(t.hover).text_color(t.foreground))
          .on_click(() => run("app.settings"))
          .child(svg("mods/workspace-chrome/settings.svg").size(12)),
      )
      .child(
        div()
          .id("palette")
          .flex_none()
          .text_color(t.dim)
          .hover((s) => s.text_color(t.foreground))
          .on_click(() => run("app.palette"))
          .child(palette ? `${palette} commands` : "commands"),
      );
  }
}
