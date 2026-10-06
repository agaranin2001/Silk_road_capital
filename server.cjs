// Production entry point for Node hosts that start the app with CommonJS require()
// (e.g. Hostinger / LiteSpeed). The server itself is an ES module, so load it with
// a dynamic import. Set the host's "Entry file" to server.cjs.
import("./scripts/dev.mjs").catch((err) => {
  console.error(err);
  process.exit(1);
});
