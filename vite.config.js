import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { handleContact } from "./server/contact.mjs";

// `npm run dev` serves the app with hot reload and the /api/contact endpoint.
// `npm run build` builds the client, then prerenders every page (scripts/prerender.mjs).
export default defineConfig({
  plugins: [
    react(),
    {
      name: "contact-endpoint",
      configureServer(server) {
        server.middlewares.use("/api/contact", (req, res) => handleContact(req, res));
      },
      configurePreviewServer(server) {
        server.middlewares.use("/api/contact", (req, res) => handleContact(req, res));
      },
    },
  ],
  build: {
    assetsDir: "assets/build", // public/assets/img stays separate from the hashed bundles
  },
  server: { port: 4330 },
  preview: { port: 4330 },
});
