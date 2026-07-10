import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import type { WeArchiveViewId } from "@we-archive/core/types";
import {
  getWeArchivePathFromView,
  getWeArchiveViewFromPathname,
  WeArchiveShell,
} from "@we-archive/ui-shared/components";
import { initApiAdapter, useWeArchiveData } from "@we-archive/ui-shared/hooks";
import { useCallback } from "react";

import { fnosAdapter } from "./api";

initApiAdapter(fnosAdapter);

export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const archiveData = useWeArchiveData();
  const activeView = getWeArchiveViewFromPathname(location.pathname);

  const goToView = useCallback(
    (viewId: WeArchiveViewId) => {
      void navigate({ to: getWeArchivePathFromView(viewId) });
    },
    [navigate],
  );

  const handleStartBackup = useCallback(async () => {
    await archiveData.startBackup();
    goToView("backup");
  }, [archiveData, goToView]);

  return (
    <WeArchiveShell
      account={archiveData.account}
      archiveStatus={archiveData.archiveStatus}
      issues={archiveData.issues}
      stats={archiveData.stats}
      tasks={archiveData.tasks}
      isLoading={archiveData.isLoading}
      error={getErrorMessage(archiveData.error)}
      activeView={activeView}
      platformLabel="飞牛 NAS 原生应用"
      runtimePlatform="fnos"
      onActiveViewChange={goToView}
      onBackupAction={handleStartBackup}
    >
      <Outlet />
    </WeArchiveShell>
  );
}

function getErrorMessage(error: unknown) {
  if (!error) {
    return null;
  }

  return error instanceof Error ? error.message : "加载失败";
}
