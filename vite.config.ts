import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base` must match the GitHub Pages sub-path (https://<user>.github.io/<repo>/).
// Override with BASE_PATH=/ when serving from a custom domain or root.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/taiwan-bus-display/",
  plugins: [react()],
});
