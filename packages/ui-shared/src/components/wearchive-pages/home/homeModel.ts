import type {
  WeArchiveArchiveStatus,
  WeArchiveHomeData,
  WeArchiveIssue,
  WeArchiveOverviewAccount,
  WeArchiveOverviewStats,
  WeArchiveOverviewTask,
  WeArchiveViewId,
} from "@we-archive/core/types";

export interface HomeNavigationIntent {
  source:
    | "home-kpi"
    | "home-summary"
    | "home-task"
    | "home-quick-action"
    | "home-account";
  metric?: string;
  issueId?: string;
}

export interface HomePageProps {
  data: WeArchiveHomeData;
  platformLabel: string;
  query?: string;
  isLoading?: boolean;
  onNavigate?:
    | ((viewId: WeArchiveViewId, intent?: HomeNavigationIntent) => void)
    | undefined;
  onBackupAction?: (() => void | Promise<void>) | undefined;
}

export type HomeSummaryState = "normal" | "attention" | "first-use";

export function getHomeSummaryState(data: WeArchiveHomeData): HomeSummaryState {
  if (!data.account || data.archiveStatus.health === "empty") {
    return "first-use";
  }

  if (data.issues.length > 0 || data.stats.pendingIssues > 0) {
    return "attention";
  }

  return "normal";
}

export function getIssueCount(data: WeArchiveHomeData) {
  return Math.max(data.issues.length, data.stats.pendingIssues);
}

export function buildFallbackIssues(
  stats: WeArchiveOverviewStats,
  error: string | null,
): WeArchiveIssue[] {
  if (error) {
    return [
      {
        id: "overview-load-error",
        severity: "error",
        title: "数据加载失败",
        description: error,
        source: "archive",
      },
    ];
  }

  if (stats.pendingIssues > 0) {
    return [
      {
        id: "pending-issues",
        severity: "warning",
        title: "存在待处理问题",
        description: `${stats.pendingIssues} 个问题需要检查，建议先查看任务和导入日志。`,
        source: "task",
      },
    ];
  }

  return [];
}

export function buildFallbackArchiveStatus(
  account: WeArchiveOverviewAccount | null,
  issues: WeArchiveIssue[],
): WeArchiveArchiveStatus {
  if (!account) {
    return {
      id: null,
      name: "暂无归档",
      health: "empty",
      importedAt: null,
    };
  }

  return {
    id: null,
    name: `${account.nickname ?? account.wxid ?? "微信账号"} 归档`,
    health: issues.length > 0 ? "attention" : "ready",
    importedAt: account.lastBackupAt ? new Date(account.lastBackupAt) : null,
  };
}

export function buildHomeData({
  account,
  stats,
  tasks,
  issues,
  archiveStatus,
  error,
}: {
  account: WeArchiveOverviewAccount | null;
  stats: WeArchiveOverviewStats;
  tasks: WeArchiveOverviewTask[];
  issues?: WeArchiveIssue[] | undefined;
  archiveStatus?: WeArchiveArchiveStatus | undefined;
  error: string | null;
}): WeArchiveHomeData {
  const normalizedIssues = issues ?? buildFallbackIssues(stats, error);

  return {
    account,
    stats,
    tasks,
    issues: normalizedIssues,
    archiveStatus:
      archiveStatus ?? buildFallbackArchiveStatus(account, normalizedIssues),
  };
}
