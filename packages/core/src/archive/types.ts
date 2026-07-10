import type {
  AttachmentType,
  BackupStatus,
  ConversationType,
  MessageType,
} from "../types";

export type ArchiveSourceType =
  | "fixture"
  | "desktop-backup"
  | "wechat-export"
  | "fnos-upload";

export interface ArchiveSourceMetadata {
  archiveId: string;
  name: string;
  sourceType: ArchiveSourceType;
  sourceVersion?: string;
  sourcePath?: string;
  createdAt: Date;
}

export interface ArchiveSourceFields {
  stableId: string;
  sourceId?: string;
  sourceHash?: string;
  rawPayload?: unknown;
}

export interface NormalizedAccountInput extends ArchiveSourceFields {
  wxid: string;
  nickname: string;
  avatar?: string;
  deviceSource?: "pc" | "ios" | "android";
  lastBackupAt?: Date;
}

export interface NormalizedContactInput extends ArchiveSourceFields {
  accountWxid: string;
  wxid: string;
  nickname: string;
  avatar?: string;
  type?: ConversationType;
  remark?: string;
}

export interface NormalizedConversationInput extends ArchiveSourceFields {
  accountWxid: string;
  conversationId: string;
  type: ConversationType;
  name: string;
  avatar?: string;
  memberCount?: number;
  messageCount?: number;
  lastMessageAt?: Date;
  backupStatus?: BackupStatus;
  isFavorite?: boolean;
}

export interface NormalizedMessageInput extends ArchiveSourceFields {
  conversationStableId: string;
  messageId?: string;
  senderWxid?: string;
  senderName?: string;
  type: MessageType;
  content?: string;
  timestamp: Date;
  hasAttachment?: boolean;
}

export interface NormalizedAttachmentInput extends ArchiveSourceFields {
  messageStableId: string;
  type: AttachmentType;
  filename?: string;
  fileSize?: number;
  filePath?: string;
  checksum?: string;
  backupStatus?: BackupStatus;
}

export interface NormalizedTaskLogInput {
  level: "info" | "warn" | "error";
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface NormalizedArchiveWarning {
  code: string;
  message: string;
  stableId?: string;
}

export interface NormalizedArchiveInput {
  metadata: ArchiveSourceMetadata;
  accounts: NormalizedAccountInput[];
  contacts: NormalizedContactInput[];
  conversations: NormalizedConversationInput[];
  messages: NormalizedMessageInput[];
  attachments: NormalizedAttachmentInput[];
  taskLogs: NormalizedTaskLogInput[];
  warnings: NormalizedArchiveWarning[];
}

export interface ImportNormalizedArchiveCounts {
  accounts: number;
  contacts: number;
  conversations: number;
  messages: number;
  attachments: number;
  duplicates: number;
  warnings: number;
  unknownTypes: number;
  taskLogs: number;
}

export interface ImportNormalizedArchiveResult {
  archiveId: number;
  importJobId: number;
  counts: ImportNormalizedArchiveCounts;
  warnings: NormalizedArchiveWarning[];
}
