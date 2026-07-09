import { useLocation, useNavigate } from "@tanstack/react-router";
import type { WeArchiveViewId } from "@we-archive/core/types";
import {
  EMPTY_OVERVIEW_STATS,
  normalizeOverviewStats,
} from "@we-archive/core/utils";
import {
  type WeArchiveRuntimePlatform,
  WeArchiveShell,
} from "@we-archive/ui-shared/components";
import {
  useAccount,
  useBackupTasks,
  useDataStats,
} from "@we-archive/ui-shared/hooks";
import { useCallback, useMemo } from "react";

type ElectronRuntimeBridge = {
  runtime?: {
    platform?: WeArchiveRuntimePlatform;
  };
  windowControls?: {
    minimize?: () => void;
    toggleMaximize?: () => void;
    close?: () => void;
  };
};

const ROUTE_TO_VIEW: Record<string, WeArchiveViewId> = {
  "/": "overview",
  "/chat-records": "records",
  "/backup-tasks": "backup",
  "/import-export": "transfer",
  "/settings": "settings",
};

const VIEW_TO_ROUTE: Record<WeArchiveViewId, string> = {
  overview: "/",
  records: "/chat-records",
  backup: "/backup-tasks",
  transfer: "/import-export",
  settings: "/settings",
};

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const accountQuery = useAccount();
  const statsQuery = useDataStats();
  const tasksQuery = useBackupTasks();
  const electronBridge = getElectronBridge();
  const activeView = ROUTE_TO_VIEW[location.pathname] ?? "overview";
  const stats = useMemo(
    () => normalizeOverviewStats(statsQuery.data ?? EMPTY_OVERVIEW_STATS),
    [statsQuery.data],
  );
  const error = getQueryErrorMessage(
    accountQuery.error,
    statsQuery.error,
    tasksQuery.error,
  );

  const goToView = useCallback(
    (viewId: WeArchiveViewId) => {
      void navigate({ to: VIEW_TO_ROUTE[viewId] });
    },
    [navigate],
  );

  return (
    <WeArchiveShell
      account={accountQuery.data ?? null}
      stats={stats}
      tasks={tasksQuery.data ?? []}
      isLoading={
        accountQuery.isLoading || statsQuery.isLoading || tasksQuery.isLoading
      }
      error={error}
      activeView={activeView}
      chrome="desktop"
      runtimePlatform={getRuntimePlatform(electronBridge)}
      windowControls={electronBridge?.windowControls}
      onActiveViewChange={goToView}
      onBackupAction={() => goToView("backup")}
    />
  );
}

function getElectronBridge(): ElectronRuntimeBridge | undefined {
  return (globalThis as { window?: { electron?: ElectronRuntimeBridge } })
    .window?.electron;
}

function getRuntimePlatform(
  electronBridge: ElectronRuntimeBridge | undefined,
): WeArchiveRuntimePlatform {
  const platform = electronBridge?.runtime?.platform;

  if (platform === "darwin" || platform === "win32" || platform === "linux") {
    return platform;
  }

  return "web";
}

function getQueryErrorMessage(...errors: unknown[]) {
  const error = errors.find(Boolean);

  if (!error) {
    return null;
  }

  return error instanceof Error ? error.message : "加载失败";
}
