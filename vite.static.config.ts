import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "static-site",
  publicDir: "../public",
  base: "/beijiang-roadbook-2026/",
  plugins: [react()],
  build: {
    outDir: "../static-dist",
    emptyOutDir: true,
  },
});
