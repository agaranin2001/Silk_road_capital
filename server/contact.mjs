// POST /api/contact — validates the "Start a conversation" form and forwards it.
//
// Integration boundary (same pattern as the Silk Road Travel site): set
//   TELEGRAM_BOT_TOKEN  – token of a bot that can post to the chat
//   TELEGRAM_CHAT_ID    – chat/channel id that should receive enquiries
// Without them the endpoint answers 503 and the page shows its error state.
// It never pretends a message was delivered. A different endpoint (e.g. a form
// service) can be configured in assets/js/config.js instead.

const MAX_BODY = 16 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(Object.assign(new Error("Payload too large"), { status: 413 }));
        req.destroy();
      } else chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });

export function validate({ name, email, message, website }) {
  const errors = {};
  if (website) errors.form = "spam"; // honeypot
  if (!name || String(name).trim().length < 2) errors.name = "Please enter your name";
  if (!email || !EMAIL_RE.test(String(email).trim())) errors.email = "Please enter a valid email address";
  if (!message || String(message).trim().length < 10) errors.message = "Please add a few words about the opportunity";
  if (message && String(message).length > 4000) errors.message = "Please keep the message under 4,000 characters";
  return errors;
}

const send = (res, status, payload) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(payload));
};

export async function handleContact(req, res) {
  if (req.method !== "POST") return send(res, 405, { ok: false, error: "method_not_allowed" });
  let data;
  try {
    data = JSON.parse(await readBody(req));
  } catch (err) {
    return send(res, err.status || 400, { ok: false, error: "invalid_body" });
  }
  const errors = validate(data);
  if (Object.keys(errors).length) return send(res, 422, { ok: false, error: "validation", fields: errors });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return send(res, 503, { ok: false, error: "not_configured" });
  }

  const clean = (v) => String(v ?? "").trim();
  const interests = Array.isArray(data.interests) ? data.interests.map(clean).filter(Boolean).join(", ") : clean(data.interests);
  const text = [
    "New enquiry — Ibn Sina Ventures",
    `Name: ${clean(data.name)}`,
    data.company ? `Company: ${clean(data.company)}` : null,
    `Email: ${clean(data.email)}`,
    data.country ? `Country: ${clean(data.country)}` : null,
    interests ? `Interested in: ${interests}` : null,
    `Message: ${clean(data.message)}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    if (!tg.ok) throw new Error(`Telegram responded ${tg.status}`);
    return send(res, 200, { ok: true });
  } catch (err) {
    console.error("[contact] delivery failed:", err.message);
    return send(res, 502, { ok: false, error: "delivery_failed" });
  }
}
