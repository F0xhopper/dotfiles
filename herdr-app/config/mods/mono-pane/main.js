// mono-pane: the header on every pane of the eden layout. Says what runs
// there, where, and on which branch; the focused pane also gets split, zoom
// and close buttons. One colour: focus is told by brightness.
import { View, div, svg } from "gpui-kit";
import { h_flex } from "gpui-base";
import { panes, props, theme, run, home } from "herdr";

const short = (cwd) => {
  if (!cwd) return "";
  const h = home();
  const p = h && cwd.startsWith(h) ? "~" + cwd.slice(h.length) : cwd;
  const parts = p.split("/");
  return parts.length > 3 ? "…/" + parts.slice(-2).join("/") : p;
};

export default class MonoPane extends View {
  render() {
    const t = theme();
    const id = props()?.pane;
    const p = panes().find((x) => x.pane === id);
    if (!p) return div();
    const stop = (_e, cx) => cx.stop_propagation();
    const button = (name, icon, action) =>
      div()
        .id(`${name}-${id}`)
        .w(22)
        .h(20)
        .flex_none()
        .flex()
        .items_center()
        .justify_center()
        .rounded(4)
        .text_color(t.dim)
        .hover((s) => s.bg(t.hover).text_color(t.foreground))
        .on_mouse_down("left", stop)
        .on_click(action)
        .child(svg(`mods/pane/${icon}.svg`).size(12));
    return h_flex()
      .size_full()
      .px(10)
      .gap(8)
      .items_center()
      .bg(t.surface)
      .border_b(1)
      .border_color(t.border)
      .text_size(11.5)
      .child(
        div()
          .flex_none()
          .text_color(p.focused ? t.foreground : t.muted)
          .when(p.focused, (el) => el.font_semibold())
          .child((p.program?.name ?? p.mod ?? "terminal").toLowerCase()),
      )
      .when(Boolean(p.cwd), (el) =>
        el.child(div().min_w(0).truncate().text_color(t.muted).child(short(p.cwd))),
      )
      .when(Boolean(p.branch), (el) =>
        el.child(
          h_flex()
            .flex_none()
            .gap(4)
            .items_center()
            .text_color(t.dim)
            .child(svg("mods/workspace-chrome/git-branch.svg").size(11))
            .child(div().max_w(140).truncate().child(p.branch)),
        ),
      )
      .child(div().flex_1())
      .when(p.status === "working", (el) =>
        el.child(
          svg("mods/workspace-chrome/spinner.svg").size(11).flex_none().text_color(t.foreground).spin(1100),
        ),
      )
      .when(p.status === "blocked", (el) =>
        el.child(
          h_flex()
            .flex_none()
            .gap(5)
            .items_center()
            .text_color(t.blocked)
            .font_semibold()
            .child(div().size(6).bg(t.blocked))
            .child("needs you"),
        ),
      )
      .when(p.status === "done", (el) => el.child(div().flex_none().text_color(t.done).child("done")))
      .when(p.focused, (el) =>
        el
          .when(p.movable || p.zoomed, (e2) =>
            e2.child(button("zoom", p.zoomed ? "unzoom" : "zoom", () => run("pane.zoom", { pane: id }))),
          )
          .child(button("right", "split-right", () => run("pane.split", { pane: id, direction: "right" })))
          .child(button("down", "split-down", () => run("pane.split", { pane: id, direction: "down" })))
          .child(button("close", "close", () => run("pane.close", { pane: id }))),
      );
  }
}
