import type { WeArchiveViewId } from "@we-archive/core/types";

export const WEARCHIVE_ROUTE_BASE_PATH = "/app/wearchive";

export const WEARCHIVE_VIEW_TO_ROUTE: Record<WeArchiveViewId, string> = {
  overview: "/",
  records: "/chat-records",
  backup: "/backup-tasks",
  transfer: "/import-export",
  restore: "/restore",
  settings: "/settings",
};

export const WEARCHIVE_ROUTE_TO_VIEW: Record<string, WeArchiveViewId> = {
  "/": "overview",
  "/chat-records": "records",
  "/backup-tasks": "backup",
  "/import-export": "transfer",
  "/restore": "restore",
  "/settings": "settings",
};

export function getWeArchivePathFromView(viewId: WeArchiveViewId): string {
  return WEARCHIVE_VIEW_TO_ROUTE[viewId];
}

export function getWeArchiveViewFromPathname(
  pathname: string,
): WeArchiveViewId {
  const routePath = normalizeWeArchivePath(pathname);

  return WEARCHIVE_ROUTE_TO_VIEW[routePath] ?? "overview";
}

function normalizeWeArchivePath(pathname: string): string {
  const normalizedPathname = ensureLeadingSlash(pathname).replace(/\/+$/g, "");
  const basePath = WEARCHIVE_ROUTE_BASE_PATH;
  const pathWithoutBase =
    normalizedPathname === basePath
      ? "/"
      : normalizedPathname.startsWith(`${basePath}/`)
        ? normalizedPathname.slice(basePath.length)
        : normalizedPathname;

  return pathWithoutBase === "" ? "/" : pathWithoutBase;
}

function ensureLeadingSlash(pathname: string): string {
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}
