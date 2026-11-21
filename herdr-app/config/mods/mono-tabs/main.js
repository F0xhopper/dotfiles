// mono-tabs: the eden layout's tab bar. Plain names, the shown tab a raised
// pill with a close button, a status mark where an agent has news, and a + for the
// shipped new-terminal/agent menu. Drag to reorder, double-click to rename,
// right-click for the tab menu.
import { View, div, svg } from "gpui-kit";
import { h_flex, ScrollHandle } from "gpui-base";
import { spaces, panes, run, openOverlay, theme, window, layout, settings } from "herdr";

function find(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const hit = find(child, id);
    if (hit) return hit;
  }
  return null;
}
const clean = (s) =>
  (s ?? "")
    .replace(/^[^\p{L}\p{N}\p{Ps}\p{Pi}]+/u, "")
    .replace(/^\[ [!.] \] /, "")
    .trim();

// A tab nobody named is called after its agent's live title, else its program.
function label(tab, lead) {
  if (tab.named) return tab.name;
  const prog = lead?.program?.name ?? "terminal";
  if (!lead?.program?.agent) return prog.toLowerCase();
  const live = clean(lead.title);
  const dull =
    !live ||
    /^[~/]/.test(live) ||
    live.includes("@") ||
    live.toLowerCase() === lead.program.key ||
    live === lead.terminal;
  return dull ? prog.toLowerCase() : live;
}

export default class MonoTabs extends View {
  init() {
    this.pressed = null; // index of the tab being dragged
    this.selected = null; // id of the tab last scrolled into view
    this.scroll = ScrollHandle.new();
  }

  render() {
    const t = theme();
    const space = spaces().find((s) => s.active);
    const shown = space?.tabs ?? [];
    const active = shown.findIndex((tab) => tab.active);
    if (shown[active]?.id !== this.selected) {
      this.selected = shown[active]?.id;
      if (active >= 0) this.scroll.scroll_to_item(active);
    }
    const stop = (_e, cx) => cx.stop_propagation();

    const item = (c, i) => {
      const lead =
        panes().find((p) => p.tab === c.id && p.program?.agent) ?? panes().find((p) => p.tab === c.id);
      return h_flex()
        .id(`tab-${c.id}`)
        .h(26)
        .px(10)
        .gap(7)
        .rounded(6)
        .items_center()
        .flex_none()
        .text_size(12.5)
        .border(1)
        .border_color(c.active ? t.border : t.chrome)
        .bg(c.active ? t.raised : t.chrome)
        .text_color(c.active ? t.foreground : c.status === "blocked" ? t.blocked : t.muted)
        .hover((s) => s.bg(t.hover).text_color(t.foreground))
        .on_mouse_down("left", (e, cx) => {
          cx.stop_propagation();
          this.pressed = i;
          if (e.click_count === 2) run("tab.rename", { id: c.id });
        })
        .on_mouse_up("left", () => {
          const from = this.pressed;
          this.pressed = null;
          if (from !== null && from !== i) run("tab.move", { id: shown[from].id, index: i + 1 });
          else run("tab.select", { id: c.id });
        })
        .on_mouse_down("right", (_e, cx) => {
          cx.stop_propagation();
          openOverlay({
            mod: "menu",
            kind: "popup",
            width: 200,
            props: { tab: "tab", target: { id: c.id, space: space.id } },
          });
        })
        .child(
          div()
            .max_w(180)
            .truncate()
            .when(c.status === "blocked", (el) => el.font_semibold())
            .child(c.zoomed ? `${label(c, lead)} [z]` : label(c, lead)),
        )
        .when(c.status === "working", (el) =>
          el.child(
            svg("mods/workspace-chrome/spinner.svg").size(10).flex_none().text_color(t.foreground).spin(1100),
          ),
        )
        .when(c.status === "blocked", (el) => el.child(div().size(6).flex_none().bg(t.blocked)))
        .when(c.status === "done", (el) =>
          el.child(div().size(6).flex_none().rounded(3).border(1).border_color(t.done)),
        )
        .when(c.active && shown.length > 1, (el) =>
          el.child(
            div()
              .id(`close-${c.id}`)
              .flex_none()
              .text_color(t.dim)
              .hover((s) => s.text_color(t.foreground))
              .on_mouse_down("left", stop)
              .on_click((_e, cx) => {
                cx.stop_propagation();
                run("tab.close", { id: c.id });
              })
              .child(svg("mods/pane/close.svg").size(11)),
          ),
        );
    };

    const root = layout(),
      sidebar = find(root, "sidebar"),
      w = window();
    // With the sidebar hidden the tabs start right of the macOS window buttons.
    const left =
      w?.platform === "macos" && w.titlebar === "none" && !w.fullscreen && root?.traffic_lights
        ? Math.max(
            6,
            (root.traffic_lights[0] + 64) / settings().zoom -
              (sidebar?.hidden ? 0 : (sidebar?.size?.px ?? 0)),
          )
        : 6;

    return h_flex()
      .size_full()
      .min_w(0)
      .pl(left)
      .pr(8)
      .items_center()
      .bg(t.chrome)
      .border_b(1)
      .border_color(t.border)
      .on_mouse_up("left", () => {
        this.pressed = null;
      })
      .child(
        h_flex()
          .id("tab-scroll")
          .flex_1()
          .min_w(0)
          .h_full()
          .items_center()
          .gap(3)
          .overflow_x_scrollbar()
          .track_scroll(this.scroll)
          .children(shown.map(item)),
      )
      .child(
        div()
          .id("tab-new")
          .w(24)
          .h(24)
          .flex_none()
          .flex()
          .items_center()
          .justify_center()
          .text_size(14)
          .text_color(t.dim)
          .hover((s) => s.text_color(t.foreground))
          .on_mouse_down("left", stop)
          .on_click(() => openOverlay({ mod: "new-menu", kind: "popup", width: 250, height: 512 }))
          .child("+"),
      );
  }
}
