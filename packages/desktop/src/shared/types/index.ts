/**
 * 账号信息
 */
export interface Account {
  id: string;
  wxid: string;
  nickname: string;
  avatar?: string;
  lastBackupAt?: Date;
  isAutoBackup: boolean;
  dataIntegrity: number; // 0-100
}

/**
 * 会话信息
 */
export interface Conversation {
  id: string;
  accountId: string;
  type: "personal" | "group" | "official" | "enterprise";
  name: string;
  avatar?: string;
  lastMessagePreview: string;
  lastMessageAt: Date;
  messageCount: number;
  hasAttachments: boolean;
  backupStatus: "none" | "partial" | "complete";
  isFavorite: boolean;
}

/**
 * 数据统计
 */
export interface DataStats {
  conversationCount: number;
  messageCount: number;
  attachmentCount: number;
  storageSize: number; // bytes
  todayNewCount: number;
  pendingIssues: number;
}

/**
 * 备份任务
 */
export interface BackupTask {
  id: string;
  accountId: string;
  status:
    | "waiting"
    | "scanning"
    | "backing-up"
    | "verifying"
    | "paused"
    | "completed"
    | "partial"
    | "failed"
    | "cancelled";
  progress: number; // 0-100
  currentStep: string;
  startedAt: Date;
  elapsedTime: number; // seconds
  savePath: string;
  errorCount: number;
}
