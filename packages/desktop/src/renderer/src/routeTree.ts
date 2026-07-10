import { createRootRoute, createRoute } from "@tanstack/react-router";
import { BackupTasksPage } from "./modules/backup-tasks/BackupTasksPage";
import { ChatRecordsPage } from "./modules/chat-records/ChatRecordsPage";
import { HomePage } from "./modules/home/HomePage";
import { ImportExportPage } from "./modules/import-export/ImportExportPage";
import { RestorePage } from "./modules/restore/RestorePage";
import { SettingsPage } from "./modules/settings/SettingsPage";
import { AppShell } from "./shared/components/AppShell";

// Root route with AppShell layout
const rootRoute = createRootRoute({
  component: AppShell,
});

// Home route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

// Chat records route
const chatRecordsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat-records",
  component: ChatRecordsPage,
});

// Backup tasks route
const backupTasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/backup-tasks",
  component: BackupTasksPage,
});

// Import/Export route
const importExportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/import-export",
  component: ImportExportPage,
});

// Restore route
const restoreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/restore",
  component: RestorePage,
});

// Settings route
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

// Create the route tree
export const routeTree = rootRoute.addChildren([
  indexRoute,
  chatRecordsRoute,
  backupTasksRoute,
  importExportRoute,
  restoreRoute,
  settingsRoute,
]);
