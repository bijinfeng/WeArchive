import { rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

rmSync(join(packageRoot, "dist"), { recursive: true, force: true });

await build({
  entryPoints: [join(packageRoot, "backend", "server.ts")],
  outfile: join(packageRoot, "dist", "server.js"),
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node22",
  sourcemap: false,
  external: [
    "@fastify/cors",
    "@fastify/static",
    "better-sqlite3",
    "drizzle-orm",
    "drizzle-orm/*",
    "fastify",
  ],
});
