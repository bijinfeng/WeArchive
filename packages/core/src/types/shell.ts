export type WeArchiveViewId =
  | "overview"
  | "records"
  | "backup"
  | "transfer"
  | "restore"
  | "settings";

export interface WeArchiveOverviewAccount {
  id?: string | number;
  wxid?: string;
  nickname?: string;
  avatar?: string | null;
  lastBackupAt?: string | Date | null;
}

export interface WeArchiveOverviewStats {
  conversationCount: number;
  messageCount: number;
  attachmentCount: number;
  storageSize: number;
  todayNewCount: number;
  pendingIssues: number;
}

export interface WeArchiveOverviewTask {
  id: string | number;
  status?: string;
  progress?: number | null;
  currentStep?: string | null;
  savePath?: string | null;
}

export interface WeArchiveOverviewData {
  account: WeArchiveOverviewAccount | null;
  stats: WeArchiveOverviewStats;
  tasks: WeArchiveOverviewTask[];
}

export interface WeArchiveStatsInput {
  conversationCount?: number | null;
  messageCount?: number | null;
  attachmentCount?: number | null;
  storageSize?: number | null;
  todayNewCount?: number | null;
  lastBackupNewCount?: number | null;
  pendingIssues?: number | null;
}
