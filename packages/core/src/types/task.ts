/**
 * 任务和错误类型定义
 */

/** 备份任务生命周期状态 */
export type TaskStatus =
  | "waiting"
  | "scanning"
  | "backing-up"
  | "verifying"
  | "paused"
  | "completed"
  | "partial"
  | "failed"
  | "cancelled";

/** 备份任务 */
export interface BackupTask {
  id: number;
  accountId: number;
  title?: string;
  accountName?: string;
  scope?: string;
  currentFile?: string | null;
  speed?: string | null;
  remainingTime?: string | null;
  processedMessages?: number | null;
  processedAttachments?: number | null;
  status: TaskStatus;
  progress: number | null; // 0-100
  currentStep: string | null;
  startedAt: Date;
  completedAt: Date | null;
  elapsedTime: number | null; // seconds
  savePath: string;
  errorCount: number | null;
  warningCount: number | null;
}

/** 备份水位线（增量备份） */
export interface BackupWatermark {
  id: string;
  accountId: string;
  lastMessageTimestamp: Date;
  lastMessageId?: string;
  updatedAt: Date;
}

/** 备份断点（断点续传） */
export interface BackupCheckpoint {
  id: string;
  taskId: string;
  conversationId: string;
  lastProcessedMessageId?: string;
  processedCount: number;
  createdAt: Date;
}

/** 统一错误类型 */
export class AppError extends Error {
  code: string;
  details?: unknown;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.details = details;
  }
}

/** 错误码 */
export const ErrorCode = {
  // 文件系统
  FILE_NOT_FOUND: "FILE_NOT_FOUND",
  FILE_READ_ERROR: "FILE_READ_ERROR",
  FILE_WRITE_ERROR: "FILE_WRITE_ERROR",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  DISK_FULL: "DISK_FULL",

  // 数据库
  DB_CONNECTION_ERROR: "DB_CONNECTION_ERROR",
  DB_QUERY_ERROR: "DB_QUERY_ERROR",
  DB_CONSTRAINT_ERROR: "DB_CONSTRAINT_ERROR",

  // 备份
  BACKUP_SOURCE_INVALID: "BACKUP_SOURCE_INVALID",
  BACKUP_PARSE_ERROR: "BACKUP_PARSE_ERROR",
  WECHAT_NOT_FOUND: "WECHAT_NOT_FOUND",
  WECHAT_RUNNING: "WECHAT_RUNNING",

  // 网络
  NETWORK_ERROR: "NETWORK_ERROR",
  PORT_OCCUPIED: "PORT_OCCUPIED",
  CONNECTION_TIMEOUT: "CONNECTION_TIMEOUT",

  // 通用
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;
