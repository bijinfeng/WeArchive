import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EMPTY_OVERVIEW_STATS } from "@we-archive/core/utils";

import { getApiAdapter, useOverviewData } from "./useApi";

export function useWeArchiveData() {
  const queryClient = useQueryClient();
  const overviewQuery = useOverviewData();
  const startBackupMutation = useMutation({
    mutationFn: () => getApiAdapter().tasks.create(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overview"] });
      queryClient.invalidateQueries({ queryKey: ["backupTasks"] });
    },
  });

  return {
    account: overviewQuery.data?.account ?? null,
    stats: overviewQuery.data?.stats ?? EMPTY_OVERVIEW_STATS,
    tasks: overviewQuery.data?.tasks ?? [],
    issues: overviewQuery.data?.issues ?? [],
    archiveStatus: overviewQuery.data?.archiveStatus,
    overview: overviewQuery.data,
    isLoading: overviewQuery.isLoading,
    error: overviewQuery.error,
    refresh: () => overviewQuery.refetch(),
    startBackup: () => startBackupMutation.mutateAsync(),
    isStartingBackup: startBackupMutation.isPending,
  };
}
