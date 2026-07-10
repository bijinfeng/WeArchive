import { astryxStylex } from "@astryxdesign/build/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const apiTarget = process.env.VITE_API_TARGET ?? "http://127.0.0.1:18790";

export default defineConfig({
  root: "frontend",
  base: process.env.VITE_BASE_PATH ?? "/app/wearchive/",
  plugins: [...astryxStylex(), react()],
  server: {
    proxy: {
      "/app/wearchive/api": {
        target: apiTarget,
        changeOrigin: true,
      },
      "/app/wearchive/health": {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
});
