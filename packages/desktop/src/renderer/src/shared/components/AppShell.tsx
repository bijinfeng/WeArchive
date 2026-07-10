import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import type { WeArchiveViewId } from "@we-archive/core/types";
import {
  getWeArchivePathFromView,
  getWeArchiveViewFromPathname,
  type WeArchiveRuntimePlatform,
  WeArchiveShell,
} from "@we-archive/ui-shared/components";
import { useWeArchiveData } from "@we-archive/ui-shared/hooks";
import { useCallback } from "react";

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

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const archiveData = useWeArchiveData();
  const electronBridge = getElectronBridge();
  const activeView = getWeArchiveViewFromPathname(location.pathname);
  const error = getQueryErrorMessage(archiveData.error);

  const goToView = useCallback(
    (viewId: WeArchiveViewId) => {
      void navigate({ to: getWeArchivePathFromView(viewId) });
    },
    [navigate],
  );

  return (
    <WeArchiveShell
      account={archiveData.account}
      archiveStatus={archiveData.archiveStatus}
      issues={archiveData.issues}
      stats={archiveData.stats}
      tasks={archiveData.tasks}
      isLoading={archiveData.isLoading}
      error={error}
      activeView={activeView}
      chrome="desktop"
      runtimePlatform={getRuntimePlatform(electronBridge)}
      windowControls={electronBridge?.windowControls}
      onActiveViewChange={goToView}
      onBackupAction={async () => {
        await archiveData.startBackup();
        goToView("backup");
      }}
    >
      <Outlet />
    </WeArchiveShell>
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
