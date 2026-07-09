import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** 账号表 */
export const accounts = sqliteTable("accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  wxid: text("wxid").notNull().unique(),
  nickname: text("nickname"),
  avatar: text("avatar"),
  deviceSource: text("device_source"),
  lastBackupAt: integer("last_backup_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

/** 会话表 */
export const conversations = sqliteTable(
  "conversations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    conversationId: text("conversation_id").notNull().unique(),
    type: text("type").notNull(),
    name: text("name").notNull(),
    avatar: text("avatar"),
    memberCount: integer("member_count").default(1),
    messageCount: integer("message_count").default(0),
    lastMessageAt: integer("last_message_at", { mode: "timestamp" }),
    backupStatus: text("backup_status").default("complete"),
    isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    accountIdx: index("idx_conversations_account").on(table.accountId),
    lastMessageIdx: index("idx_conversations_last_message").on(
      table.lastMessageAt,
    ),
  }),
);

/** 消息表 */
export const messages = sqliteTable(
  "messages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    conversationId: integer("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    messageId: text("message_id"),
    senderWxid: text("sender_wxid"),
    senderName: text("sender_name"),
    type: text("type").notNull(),
    content: text("content"),
    timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
    hasAttachment: integer("has_attachment", { mode: "boolean" }).default(
      false,
    ),
    rawPayload: text("raw_payload"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    conversationIdx: index("idx_messages_conversation").on(
      table.conversationId,
    ),
    timestampIdx: index("idx_messages_timestamp").on(table.timestamp),
    typeIdx: index("idx_messages_type").on(table.type),
    senderIdx: index("idx_messages_sender").on(table.senderWxid),
  }),
);

/** 附件表 */
export const attachments = sqliteTable(
  "attachments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    messageId: integer("message_id")
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    filename: text("filename"),
    fileSize: integer("file_size"),
    filePath: text("file_path"),
    checksum: text("checksum"),
    backupStatus: text("backup_status").default("complete"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    messageIdx: index("idx_attachments_message").on(table.messageId),
    typeIdx: index("idx_attachments_type").on(table.type),
  }),
);

/** 备份任务表 */
export const backupTasks = sqliteTable("backup_tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accountId: integer("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  progress: integer("progress").default(0),
  currentStep: text("current_step"),
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  elapsedTime: integer("elapsed_time").default(0),
  savePath: text("save_path").notNull(),
  errorCount: integer("error_count").default(0),
  warningCount: integer("warning_count").default(0),
});

/** 备份水位线表（增量备份） */
export const backupWatermarks = sqliteTable("backup_watermarks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accountId: integer("account_id")
    .notNull()
    .unique()
    .references(() => accounts.id, { onDelete: "cascade" }),
  lastMessageTimestamp: integer("last_message_timestamp", {
    mode: "timestamp",
  }).notNull(),
  lastMessageId: text("last_message_id"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

/** 备份断点表（断点续传） */
export const backupCheckpoints = sqliteTable("backup_checkpoints", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskId: integer("task_id")
    .notNull()
    .references(() => backupTasks.id, { onDelete: "cascade" }),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversations.id),
  lastProcessedMessageId: text("last_processed_message_id"),
  processedCount: integer("processed_count").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

/** 设置表（KV 存储） */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
