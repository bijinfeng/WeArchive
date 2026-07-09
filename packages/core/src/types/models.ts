/**
 * 核心数据模型类型定义
 */

/** 账号 */
export interface Account {
  id: string;
  wxid: string;
  nickname: string;
  avatar?: string;
  deviceSource?: "pc" | "ios" | "android";
  lastBackupAt?: Date;
  createdAt: Date;
}

/** 会话类型 */
export type ConversationType = "personal" | "group" | "official" | "enterprise";

/** 备份状态 */
export type BackupStatus = "none" | "partial" | "complete";

/** 会话 */
export interface Conversation {
  id: string;
  accountId: string;
  conversationId: string;
  type: ConversationType;
  name: string;
  avatar?: string;
  memberCount: number;
  messageCount: number;
  lastMessagePreview: string;
  lastMessageAt?: Date;
  hasAttachments: boolean;
  backupStatus: BackupStatus;
  isFavorite: boolean;
  createdAt: Date;
}

/** 消息类型 */
export type MessageType =
  | "text"
  | "image"
  | "video"
  | "voice"
  | "file"
  | "link"
  | "miniprogram"
  | "transfer"
  | "system";

/** 消息 */
export interface Message {
  id: string;
  conversationId: string;
  messageId?: string;
  senderWxid?: string;
  senderName?: string;
  type: MessageType;
  content?: string;
  timestamp: Date;
  hasAttachment: boolean;
  rawPayload?: string;
  createdAt: Date;
}

/** 附件类型 */
export type AttachmentType = "image" | "video" | "file" | "voice";

/** 附件 */
export interface Attachment {
  id: string;
  messageId: string;
  type: AttachmentType;
  filename?: string;
  fileSize?: number;
  filePath?: string;
  checksum?: string;
  backupStatus: BackupStatus;
  createdAt: Date;
}

/** 数据统计 */
export interface DataStats {
  conversationCount: number;
  messageCount: number;
  attachmentCount: number;
  storageSize: number;
  lastBackupNewCount: number;
  pendingIssues: number;
}
