import { astryxStylex } from "@astryxdesign/build/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [...astryxStylex()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
  },
});
