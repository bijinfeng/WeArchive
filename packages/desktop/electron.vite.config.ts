import { builtinModules } from "node:module";
import { fileURLToPath, URL } from "node:url";
import { astryxStylex } from "@astryxdesign/build/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "electron-vite";

const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));
const electronRuntimeExternals = [
  "electron",
  /^electron\/.+/,
  ...builtinModules.flatMap((moduleName) => [moduleName, `node:${moduleName}`]),
];
const workspacePackagesToBundleInMain = [
  "@hexo-cms/core",
  "@hexo-cms/plugins",
  "@hexo-cms/plugin-attachments-helper",
  "@hexo-cms/plugin-comments-overview",
  "@hexo-cms/plugin-draft-coach",
  "@hexo-cms/plugin-seo-inspector",
  "@hexo-cms/ui",
];

const loadWorkspaceEnv = (mode: string) => {
  const env = loadEnv(mode, workspaceRoot, "");

  for (const [key, value] of Object.entries(env)) {
    process.env[key] ??= value;
  }
};

export default defineConfig(({ mode }) => {
  loadWorkspaceEnv(mode);

  return {
    main: {
      envDir: workspaceRoot,
      build: {
        externalizeDeps: {
          exclude: workspacePackagesToBundleInMain,
        },
      },
    },
    preload: {
      envDir: workspaceRoot,
      build: {
        externalizeDeps: false,
        rollupOptions: {
          external: electronRuntimeExternals,
          output: {
            format: "cjs",
          },
        },
      },
    },
    renderer: {
      envDir: workspaceRoot,
      plugins: [...astryxStylex(), react()],
      resolve: {
        alias: {
          "#": "./src/renderer/src",
        },
      },
    },
  };
});
