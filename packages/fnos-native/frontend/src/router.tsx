import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { WeArchiveRoutePage } from "@we-archive/ui-shared/components";

import { App } from "./App";

const rootRoute = createRootRoute({
  component: App,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: OverviewRoute,
});

const chatRecordsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat-records",
  component: RecordsRoute,
});

const backupTasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/backup-tasks",
  component: BackupRoute,
});

const importExportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/import-export",
  component: TransferRoute,
});

const restoreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/restore",
  component: RestoreRoute,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsRoute,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  chatRecordsRoute,
  backupTasksRoute,
  importExportRoute,
  restoreRoute,
  settingsRoute,
]);

export const router = createRouter({
  routeTree,
  basepath: getRouterBasePath(import.meta.env.BASE_URL),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function Router() {
  return <RouterProvider router={router} />;
}

function getRouterBasePath(baseUrl: string) {
  const basePath = baseUrl.replace(/\/+$/g, "");

  return basePath === "" ? "/" : basePath;
}

function OverviewRoute() {
  return <WeArchiveRoutePage viewId="overview" />;
}

function RecordsRoute() {
  return <WeArchiveRoutePage viewId="records" />;
}

function BackupRoute() {
  return <WeArchiveRoutePage viewId="backup" />;
}

function TransferRoute() {
  return <WeArchiveRoutePage viewId="transfer" />;
}

function RestoreRoute() {
  return <WeArchiveRoutePage viewId="restore" />;
}

function SettingsRoute() {
  return <WeArchiveRoutePage viewId="settings" />;
}
