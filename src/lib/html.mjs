// Minimal tagged-template HTML renderer. Interpolated values are escaped unless
// they are already rendered HTML (`html\`\`` results or `raw()`), so content from
// the JSON files can never inject markup by accident.

class SafeHtml {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]);

export const raw = (value) => new SafeHtml(String(value ?? ""));

function render(value) {
  if (value === null || value === undefined || value === false || value === true) return "";
  if (Array.isArray(value)) return value.map(render).join("");
  if (value instanceof SafeHtml) return value.value;
  return escape(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  values.forEach((value, i) => {
    out += render(value) + strings[i + 1];
  });
  return new SafeHtml(out);
}

// Render a multi-line string as text with <br> line breaks (escaped).
export const lines = (text) => raw(String(text).split("\n").map(escape).join("<br>"));

export const attrs = (obj) =>
  raw(
    Object.entries(obj)
      .filter(([, v]) => v !== undefined && v !== null && v !== false)
      .map(([k, v]) => (v === true ? k : `${k}="${escape(v)}"`))
      .join(" "),
  );
