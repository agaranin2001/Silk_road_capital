/* Integration settings. The contact form posts JSON to `contactEndpoint`:
 * the bundled Node server (/api/contact, forwards to Telegram) or any form service
 * that accepts JSON. See README.md → "Contact form". */
window.SRC_CONFIG = {
  contactEndpoint: "/api/contact",
};
