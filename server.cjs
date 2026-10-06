// Production entry point for Node hosts that start the app with CommonJS require()
// (e.g. Hostinger / LiteSpeed). The server is an ES module, so load it with a dynamic
// import. Set the host's "Entry file" to server.cjs (build command: npm run build).
import("./scripts/serve.mjs").catch((err) => {
  console.error(err);
  process.exit(1);
});
