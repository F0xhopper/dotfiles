// mono-side: the whole sidebar of the eden layout, in one colour.
// Spaces on top, agents underneath; text only, no icons or tiles.
// Status is told by shape and weight rather than hue:
//   blocked  ■ bright, bold title     working  spinning ring
//   done     ○ ring                   idle     · dot
// props.role "head" is the empty strip beside the window buttons.
import { View, div, svg } from "gpui-kit";
import { v_flex, h_flex } from "gpui-base";
import { spaces, agents, theme, run, props, openOverlay, setAgentOrder } from "herdr";

// Drops the glyph or spinner an agent puts before its title.
const clean = (s) =>
  (s ?? "")
    .replace(/^[^\p{L}\p{N}\p{Ps}\p{Pi}]+/u, "")
    .replace(/^\[ [!.] \] /, "")
    .trim();
const RANK = { blocked: 4, done: 3, working: 2, idle: 1 };

function mark(status, t) {
  const box = div().w(14).h(14).flex_none().flex().items_center().justify_center();
  if (status === "working")
    return box.child(svg("mods/workspace-chrome/spinner.svg").size(11).text_color(t.foreground).spin(1100));
  if (status === "blocked") return box.child(div().size(7).bg(t.blocked));
  if (status === "done") return box.child(div().size(7).rounded(4).border(1).border_color(t.done));
  if (status === "idle") return box.child(div().size(3).rounded(2).bg(t.dim));
  return box;
}

function agentTitle(a) {
  const live = clean(a.title);
  const path = /^[~/]/.test(live) || live.includes("@");
  if (live && !path && live.toLowerCase() !== a.program?.key && live !== a.address) return live;
  return a.tab_name && !/^\d+$/.test(a.tab_name) ? a.tab_name : (a.program?.name ?? a.address);
}

const ago = (ms) => {
  if (!ms) return "";
  const m = Math.floor((Date.now() - ms) / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d`;
};

export default class MonoSide extends View {
  init(_props, cx) {
    // Only the "3m" on agent rows needs a clock.
    if (props()?.role !== "head") cx.timer.every(30000, (cx) => cx.notify());
  }

  render() {
    const t = theme();
    if (props()?.role === "head") return div().size_full().bg(t.chrome);

    const heading = (text, action) =>
      h_flex()
        .h(24)
        .px(14)
        .items_center()
        .justify_between()
        .text_size(10.5)
        .text_color(t.dim)
        .child(text)
        .when(Boolean(action), (el) =>
          el.child(
            div()
              .id(`add-${text}`)
              .px(4)
              .text_size(13)
              .hover((s) => s.text_color(t.foreground))
              .on_click(action)
              .child("+"),
          ),
        );

    const spaceRow = (s) =>
      h_flex()
        .id(`space-${s.id}`)
        .h(28)
        .px(14)
        .gap(8)
        .items_center()
        .text_size(12.5)
        .text_color(s.active ? t.foreground : t.muted)
        .when(s.active, (el) => el.bg(t.selected))
        .hover((st) => st.bg(t.hover))
        .on_click(() => run("space.select", { id: s.id }))
        .on_mouse_down("right", (_e, cx) => {
          cx.stop_propagation();
          openOverlay({
            mod: "menu",
            kind: "popup",
            width: 200,
            height: 260,
            props: { tab: "space", target: { id: s.id } },
          });
        })
        .child(div().flex_1().min_w(0).truncate().child(s.name))
        .when(Boolean(s.branch), (el) =>
          el.child(div().max_w(80).truncate().text_size(11).text_color(t.dim).child(s.branch)),
        )
        .when(!s.branch && s.tabs.length > 1, (el) =>
          el.child(div().flex_none().text_size(11).text_color(t.dim).child(`${s.tabs.length} tabs`)),
        )
        .child(mark(s.status, t));

    const tabs = new Map(spaces().flatMap((s) => s.tabs.map((tab) => [tab.id, tab])));
    // How long it has been working, else since it last changed state.
    const since = (a) => {
      const tab = tabs.get(a.tab);
      return ago(a.status === "working" ? (tab?.working_since ?? tab?.changed_at) : tab?.changed_at);
    };
    const list = [...agents()].sort(
      (a, b) => b.pinned - a.pinned || (RANK[b.status] ?? 0) - (RANK[a.status] ?? 0) || b.seq - a.seq,
    );
    setAgentOrder(list.map((a) => a.address));
    const agentRow = (a) =>
      h_flex()
        .id(`agent-${a.address}`)
        .h(28)
        .px(14)
        .gap(8)
        .items_center()
        .text_size(12.5)
        .text_color(a.status === "blocked" ? t.blocked : a.status === "idle" ? t.muted : t.foreground)
        .when(a.focused, (el) => el.bg(t.selected))
        .hover((st) => st.bg(t.hover))
        .on_click(() => run("pane.focus", { pane: a.pane }))
        .child(mark(a.status, t))
        .child(
          div()
            .flex_1()
            .min_w(0)
            .truncate()
            .when(a.status === "blocked", (el) => el.font_semibold())
            .child(agentTitle(a)),
        )
        .child(div().flex_none().text_size(11).text_color(t.dim).child(since(a)));

    return v_flex()
      .id("side")
      .size_full()
      .bg(t.chrome)
      .pt(2)
      .pb(8)
      .overflow_y_scrollbar()
      .child(heading("spaces", () => run("space.new")))
      .children(spaces().map(spaceRow))
      .child(div().h(14).flex_none())
      .child(heading("agents"))
      .when(list.length === 0, (el) =>
        el.child(div().px(14).text_size(11.5).text_color(t.dim).child("none running")),
      )
      .children(list.map(agentRow));
  }
}
