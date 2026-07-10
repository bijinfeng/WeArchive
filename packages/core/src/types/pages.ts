import type {
  Conversation,
  ConversationType,
  Message,
  MessageType,
} from "./models";
import type {
  WeArchiveOverviewAccount,
  WeArchiveOverviewData,
  WeArchiveOverviewStats,
  WeArchiveOverviewTask,
} from "./shell";
import type { BackupTask, TaskStatus } from "./task";

export interface WeArchiveIssue {
  id: string;
  severity: "info" | "warning" | "error";
  title: string;
  description: string;
  source: "archive" | "attachment" | "message" | "task" | "restore";
}

export interface WeArchiveArchiveStatus {
  id: number | null;
  name: string;
  health: "empty" | "ready" | "attention";
  sourceType?: string;
  importedAt: Date | null;
}

export interface WeArchiveHomeData extends WeArchiveOverviewData {
  stats: WeArchiveOverviewStats;
  account: WeArchiveOverviewAccount | null;
  tasks: WeArchiveOverviewTask[];
  issues: WeArchiveIssue[];
  archiveStatus: WeArchiveArchiveStatus;
}

export interface ConversationListParams {
  query?: string;
  type?: ConversationType;
  backupStatus?: "none" | "partial" | "complete";
  hasAttachments?: boolean;
  limit?: number;
  offset?: number;
}

export interface ConversationListResult {
  items: Conversation[];
  total: number;
}

export interface ConversationDetail {
  conversation: Conversation;
  risks: WeArchiveIssue[];
  canExport: boolean;
  canRebackup: boolean;
}

export interface MessageListParams {
  conversationId: string | number;
  query?: string;
  messageType?: MessageType;
  cursor?: string;
  limit?: number;
}

export interface MessageListResult {
  items: Message[];
  total: number;
  nextCursor: string | null;
}

export interface TaskLog {
  id: number;
  taskId: number | null;
  importJobId: number | null;
  exportJobId: number | null;
  level: "info" | "warn" | "error";
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface TaskDetail {
  task: BackupTask;
  logs: TaskLog[];
  validActions: Array<"start" | "pause" | "resume" | "cancel" | "retry">;
}

export interface CreateTaskInput {
  accountId: number;
  savePath: string;
  currentStep?: string;
}

export interface TaskLogListParams {
  taskId?: number;
  importJobId?: number;
  exportJobId?: number;
  level?: TaskLog["level"] | "all";
}

export interface ImportDraftPlan {
  counts: {
    accounts: number;
    contacts: number;
    conversations: number;
    messages: number;
    attachments: number;
  };
  warnings: WeArchiveIssue[];
}

export interface ExportDraftPlan {
  format: "html" | "csv" | "json";
  conversationCount: number;
  messageCount: number;
  estimatedSize: number;
  warnings: WeArchiveIssue[];
}

export interface ExportDraftInput {
  conversationIds: Array<string | number>;
  format: ExportDraftPlan["format"];
}

export interface ExecuteImportInput {
  sourcePath?: string;
}

export interface ExecuteImportResult {
  archiveId: number;
  importJobId: number;
  counts: ImportDraftPlan["counts"] & {
    duplicates: number;
    warnings: number;
    unknownTypes: number;
    taskLogs: number;
  };
  warnings: WeArchiveIssue[];
}

export interface ExecuteExportInput extends ExportDraftInput {
  targetDir: string;
  baseName?: string;
  maskSensitive?: boolean;
}

export interface ExportArtifactSummary {
  format: ExportDraftPlan["format"];
  filePath: string;
  conversationCount: number;
  messageCount: number;
  attachmentCount: number;
}

export interface ExecuteExportResult {
  exportJobId: number;
  artifacts: ExportArtifactSummary[];
  conversationCount: number;
  messageCount: number;
  warnings: WeArchiveIssue[];
}

export interface RestoreStrategyInput {
  strategy: "merge" | "overwrite" | "new-archive";
  restorePointId?: number;
}

export interface RestorePointSummary {
  id: number;
  archiveId: number | null;
  name: string;
  status: string;
  checkedAt: Date | null;
  createdAt: Date;
}

export interface RestoreStrategyPreview {
  strategy: RestoreStrategyInput["strategy"];
  disabledReason: string;
  risks: WeArchiveIssue[];
}

export interface RestoreExecutionResult {
  ok: false;
  disabledReason: string;
}

export interface SettingWriteResult {
  key: string;
  value: unknown;
  previousValue: string | null;
  rollbackValue: string | null;
  previousExists: boolean;
  updatedAt: Date;
}

export type { TaskStatus };
