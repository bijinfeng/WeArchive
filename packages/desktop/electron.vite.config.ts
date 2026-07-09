import { fileURLToPath } from "node:url";
import { astryxStylex } from "@astryxdesign/build/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "electron-vite";

const rendererSrc = fileURLToPath(
  new URL("./src/renderer/src", import.meta.url),
);

export default defineConfig(() => {
  return {
    main: {},
    preload: {},
    renderer: {
      plugins: [...astryxStylex(), react()],
      resolve: {
        alias: [{ find: /^#\/(.*)$/, replacement: `${rendererSrc}/$1` }],
      },
    },
  };
});
