import type {
  WeArchiveOverviewAccount,
  WeArchiveOverviewStats,
  WeArchiveOverviewTask,
  WeArchiveViewId,
} from "@we-archive/core/types";
import { EMPTY_OVERVIEW_STATS } from "@we-archive/core/utils";
import { WeArchiveShell } from "@we-archive/ui-shared/components";
import { useCallback, useEffect, useState } from "react";

import { loadOverview, startBackup } from "./api";

export function App() {
  const [activeView, setActiveView] = useState<WeArchiveViewId>("overview");
  const [account, setAccount] = useState<WeArchiveOverviewAccount | null>(null);
  const [stats, setStats] =
    useState<WeArchiveOverviewStats>(EMPTY_OVERVIEW_STATS);
  const [tasks, setTasks] = useState<WeArchiveOverviewTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setError(null);
    const overview = await loadOverview(signal);
    setAccount(overview.account);
    setStats(overview.stats);
    setTasks(overview.tasks);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    refresh(controller.signal)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "加载失败");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [refresh]);

  const handleStartBackup = useCallback(async () => {
    await startBackup();
    await refresh();
    setActiveView("backup");
  }, [refresh]);

  return (
    <WeArchiveShell
      account={account}
      stats={stats}
      tasks={tasks}
      isLoading={isLoading}
      error={error}
      activeView={activeView}
      platformLabel="飞牛 NAS 原生应用"
      runtimePlatform="fnos"
      onActiveViewChange={setActiveView}
      onBackupAction={handleStartBackup}
    />
  );
}
