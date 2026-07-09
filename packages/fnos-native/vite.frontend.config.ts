import { astryxStylex } from "@astryxdesign/build/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "frontend",
  base: process.env.VITE_BASE_PATH ?? "/app/wearchive/",
  plugins: [...astryxStylex(), react()],
  server: {
    proxy: {
      "/app/wearchive/api": {
        target: "http://127.0.0.1:7890",
        changeOrigin: true,
      },
      "/app/wearchive/health": {
        target: "http://127.0.0.1:7890",
        changeOrigin: true,
      },
    },
  },
});
