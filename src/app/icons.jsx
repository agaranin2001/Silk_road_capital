// Inline SVG icon set (currentColor), drawn on a 24px grid with a 1.5 stroke — the same set
// and weight as the Silk Road Travel site. <Icon name="arrow" className="…" />
const ICONS = {
  star8: {"vb":"0 0 24 24","b":"<rect x=\"3.5\" y=\"3.5\" width=\"17\" height=\"17\"/><rect x=\"3.5\" y=\"3.5\" width=\"17\" height=\"17\" transform=\"rotate(45 12 12)\"/>"},
  spark: {"vb":"0 0 12 12","b":"<path d=\"M6 0l1.6 4.4L12 6 7.6 7.6 6 12 4.4 7.6 0 6l4.4-1.6z\"/>"},
  arrow: {"s":1,"b":"<path d=\"M5 12h14M13 6l6 6-6 6\"/>"},
  arrowUpRight: {"s":1,"b":"<path d=\"M7 17L17 7M8 7h9v9\"/>"},
  arrowDown: {"s":1,"b":"<path d=\"M12 5v14M6 13l6 6 6-6\"/>"},
  caret: {"s":1,"b":"<path d=\"M6 9l6 6 6-6\"/>"},
  close: {"s":1,"b":"<path d=\"M6 6l12 12M18 6L6 18\"/>"},
  plus: {"s":1,"b":"<path d=\"M12 4v16M4 12h16\"/>"},
  minus: {"s":1,"b":"<path d=\"M4 12h16\"/>"},
  check: {"s":1,"b":"<path d=\"M5 12.5l4.2 4L19 7\"/>"},
  checkCircle: {"s":1,"b":"<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M8 12.5l2.7 2.5L16 9.5\"/>"},
  lock: {"s":1,"b":"<rect x=\"5\" y=\"10.5\" width=\"14\" height=\"10\" rx=\"1.5\"/><path d=\"M8 10.5V7.5a4 4 0 0 1 8 0v3\"/>"},
  doc: {"s":1,"b":"<path d=\"M7 3h7l4 4v14H7z\"/><path d=\"M14 3v4h4M10 12h5M10 16h5\"/>"},
  globe: {"s":1,"b":"<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18\"/>"},
  clock: {"s":1,"b":"<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/>"},
  chevronRight: {"s":1,"b":"<path d=\"M9 6l6 6-6 6\"/>"},
  chevronLeft: {"s":1,"b":"<path d=\"M15 6l-6 6 6 6\"/>"},
  chart: {"s":1,"b":"<path d=\"M4 20V10M10 20V4M16 20v-7M22 20H2\"/>"},
  compass: {"s":1,"b":"<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M15.5 8.5l-2 5-5 2 2-5z\"/>"},
  link: {"s":1,"b":"<path d=\"M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1\"/><path d=\"M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1\"/>"},
  flag: {"s":1,"b":"<path d=\"M5 21V4M5 4h11l-2 4 2 4H5\"/>"},
  layers: {"s":1,"b":"<path d=\"M12 3l9 5-9 5-9-5z\"/><path d=\"M3 13l9 5 9-5\"/>"},
  cpu: {"s":1,"b":"<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"1.5\"/><rect x=\"9.5\" y=\"9.5\" width=\"5\" height=\"5\"/><path d=\"M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4\"/>"},
  box: {"s":1,"b":"<path d=\"M3 7.5L12 3l9 4.5v9L12 21l-9-4.5z\"/><path d=\"M3 7.5l9 4.5 9-4.5M12 12v9\"/>"},
  trending: {"s":1,"b":"<path d=\"M3 17l6-6 4 4 8-8\"/><path d=\"M15 7h6v6\"/>"},
  building: {"s":1,"b":"<path d=\"M4 21V5l8-2v18M12 8l8 3v10M2 21h20M7 8h2M7 12h2M7 16h2M15 13h2M15 17h2\"/>"},
  briefcase: {"s":1,"b":"<rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"1.5\"/><path d=\"M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 12.5h18\"/>"},
  shield: {"s":1,"b":"<path d=\"M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z\"/><path d=\"M8.8 12l2.3 2.3 4.2-4.6\"/>"},
};

// Icons that point along the reading direction; mirrored in right-to-left pages.
const DIRECTIONAL = new Set(["arrow", "arrowUpRight", "chevronRight", "chevronLeft"]);

export function Icon({ name, className = "" }) {
  const i = ICONS[name];
  if (!i) return null;
  const cls = `${className}${DIRECTIONAL.has(name) ? " icon-dir" : ""}`.trim() || undefined;
  const common = { className: cls, "aria-hidden": "true", focusable: "false", dangerouslySetInnerHTML: { __html: i.b } };
  return i.s
    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...common} />
    : <svg viewBox={i.vb} fill="currentColor" {...common} />;
}
