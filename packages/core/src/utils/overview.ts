import type { WeArchiveOverviewStats, WeArchiveStatsInput } from "../types";

export const EMPTY_OVERVIEW_STATS: WeArchiveOverviewStats = {
  conversationCount: 0,
  messageCount: 0,
  attachmentCount: 0,
  storageSize: 0,
  todayNewCount: 0,
  pendingIssues: 0,
};

export function normalizeOverviewStats(
  stats?: WeArchiveStatsInput | null,
): WeArchiveOverviewStats {
  return {
    conversationCount:
      stats?.conversationCount ?? EMPTY_OVERVIEW_STATS.conversationCount,
    messageCount: stats?.messageCount ?? EMPTY_OVERVIEW_STATS.messageCount,
    attachmentCount:
      stats?.attachmentCount ?? EMPTY_OVERVIEW_STATS.attachmentCount,
    storageSize: stats?.storageSize ?? EMPTY_OVERVIEW_STATS.storageSize,
    todayNewCount:
      stats?.todayNewCount ??
      stats?.lastBackupNewCount ??
      EMPTY_OVERVIEW_STATS.todayNewCount,
    pendingIssues: stats?.pendingIssues ?? EMPTY_OVERVIEW_STATS.pendingIssues,
  };
}
