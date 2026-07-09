import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(packageRoot, "..", "..");
const frontendRoot = join(packageRoot, "frontend");
const serverDir = join(packageRoot, "wearchive", "app", "server");
const serverDistDir = join(packageRoot, "dist");
const frontendDistDir = join(frontendRoot, "dist");
const nodeModulesDir = join(packageRoot, "node_modules");

run("pnpm", ["--dir", "packages/fnos-native", "build:ui"], repoRoot);
run("pnpm", ["--dir", "packages/fnos-native", "build"], repoRoot);

assertFile(join(serverDistDir, "server.js"), "Server build output");
assertFile(join(frontendDistDir, "index.html"), "fnOS frontend build output");

resetDir(serverDir);
cpSync(serverDistDir, join(serverDir, "dist"), { recursive: true });
cpSync(frontendDistDir, join(serverDir, "public"), { recursive: true });
copyRuntimeNodeModules();
writeServerPackageJson();

function run(command, args, cwd) {
  execFileSync(command, args, {
    cwd,
    stdio: "inherit",
  });
}

function assertFile(path, label) {
  if (!existsSync(path)) {
    throw new Error(`${label} was not found at ${path}`);
  }
}

function resetDir(path) {
  rmSync(path, { recursive: true, force: true });
  mkdirSync(path, { recursive: true });
}

function copyRuntimeNodeModules() {
  if (!existsSync(nodeModulesDir)) {
    throw new Error(`Runtime node_modules was not found at ${nodeModulesDir}`);
  }

  cpSync(nodeModulesDir, join(serverDir, "node_modules"), {
    recursive: true,
    dereference: true,
  });
}

function writeServerPackageJson() {
  const packageJson = JSON.parse(
    readFileSync(join(packageRoot, "package.json"), "utf8"),
  );
  const dependencies = Object.fromEntries(
    Object.entries(packageJson.dependencies).filter(
      ([, version]) => !String(version).startsWith("workspace:"),
    ),
  );

  writeFileSync(
    join(serverDir, "package.json"),
    `${JSON.stringify(
      {
        name: "wearchive-fnos-server",
        version: packageJson.version,
        private: true,
        type: "module",
        main: "dist/server.js",
        scripts: {
          start: "node dist/server.js",
        },
        dependencies,
      },
      null,
      2,
    )}\n`,
  );
}
