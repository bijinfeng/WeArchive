import { existsSync, mkdirSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { initDatabase } from "@we-archive/core/database";
import Fastify from "fastify";

import { registerRoutes } from "./routes";

const moduleDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(moduleDir, "..");
const gatewayPrefix = normalizeGatewayPrefix(
  process.env.GATEWAY_PREFIX || "/app/wearchive",
);

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
  },
});

// CORS（允许浏览器访问）
server.register(fastifyCors, {
  origin: true,
});

// 初始化数据库
const dataDir = resolveDataDir();
mkdirSync(dataDir, { recursive: true });

const dbPath = process.env.DB_PATH || join(dataDir, "wearchive.db");
try {
  initDatabase(dbPath);
  server.log.info(`Database initialized at ${dbPath}`);
} catch (error) {
  server.log.error(
    { error },
    "Database initialization failed; API fallback mode enabled",
  );
}

// 注册 API 路由
registerRoutes(server);

server.register(
  (app, _options, done) => {
    registerRoutes(app);
    done();
  },
  { prefix: gatewayPrefix },
);

registerStaticUi();

// 启动服务器
const port = Number(process.env.PORT) || 7890;
const host = process.env.HOST || "0.0.0.0";
const socketPath = process.env.SOCKET_PATH;

if (socketPath) {
  mkdirSync(dirname(socketPath), { recursive: true });
  rmSync(socketPath, { force: true });

  server.listen({ path: socketPath }, (err, address) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }

    server.log.info(`Server listening at ${address}`);
  });
} else {
  server.listen({ port, host }, (err, address) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }

    server.log.info(`Server listening at ${address}`);
  });
}

// 优雅关闭
const signals = ["SIGINT", "SIGTERM"] as const;
signals.forEach((signal) => {
  process.on(signal, async () => {
    server.log.info(`Received ${signal}, closing server...`);
    await server.close();
    process.exit(0);
  });
});

function normalizeGatewayPrefix(prefix: string) {
  const trimmed = prefix.trim().replace(/\/+$/, "");

  if (!trimmed) {
    return "";
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function resolveDataDir() {
  const dataSharePath = process.env.TRIM_DATA_SHARE_PATHS?.split(":")[0];
  return resolve(process.env.DATA_DIR || dataSharePath || process.cwd());
}

function resolveUiDir() {
  const candidates = [
    process.env.FRONTEND_DIST,
    join(packageRoot, "frontend", "dist"),
    join(packageRoot, "wearchive", "app", "server", "public"),
    join(packageRoot, "public"),
    join(process.cwd(), "public"),
  ].filter(Boolean) as string[];

  return candidates.find((candidate) =>
    existsSync(join(candidate, "index.html")),
  );
}

function registerStaticUi() {
  const uiDir = resolveUiDir();

  if (!uiDir) {
    server.log.warn("No UI directory found; API-only mode enabled");
    return;
  }

  const staticPrefixes = [gatewayPrefix ? `${gatewayPrefix}/` : "/"].filter(
    (prefix, index, prefixes) =>
      prefix !== "//" && prefixes.indexOf(prefix) === index,
  );

  for (const [index, prefix] of staticPrefixes.entries()) {
    server.register(fastifyStatic, {
      root: uiDir,
      prefix,
      decorateReply: index === 0,
    });
  }

  server.setNotFoundHandler(async (request, reply) => {
    const pathname = new URL(request.url, "http://localhost").pathname;
    const appPath = pathname.startsWith(gatewayPrefix)
      ? pathname.slice(gatewayPrefix.length) || "/"
      : pathname;

    if (appPath.startsWith("/api/") || appPath === "/health") {
      return reply.code(404).send({ error: "Not Found" });
    }

    if (appPath.startsWith("/assets/")) {
      return reply.code(404).send({ error: "Asset Not Found" });
    }

    const indexHtml = await readFile(join(uiDir, "index.html"), "utf8");
    return reply.type("text/html").send(indexHtml);
  });

  server.log.info(`Serving UI from ${uiDir}`);
}
