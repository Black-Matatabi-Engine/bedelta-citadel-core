import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    "import.meta.env.NEXT_PUBLIC_HUD_CANARY": JSON.stringify("bedelta-stealth"),
  },
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(rootDir, "index.html"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8789",
        changeOrigin: true,
      },
    },
  },
});