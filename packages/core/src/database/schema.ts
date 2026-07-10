import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

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

/** 归档库表 */
export const archives = sqliteTable("archives", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  archiveId: text("archive_id").notNull().unique(),
  name: text("name").notNull(),
  sourceType: text("source_type").notNull(),
  sourceVersion: text("source_version"),
  importedAt: integer("imported_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

/** 联系人表 */
export const contacts = sqliteTable(
  "contacts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    stableId: text("stable_id").notNull(),
    wxid: text("wxid").notNull(),
    nickname: text("nickname").notNull(),
    avatar: text("avatar"),
    type: text("type").notNull().default("personal"),
    remark: text("remark"),
    sourceId: text("source_id"),
    sourceHash: text("source_hash"),
    rawPayload: text("raw_payload"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    accountIdx: index("idx_contacts_account").on(table.accountId),
    wxidIdx: index("idx_contacts_wxid").on(table.wxid),
    accountStableIdx: uniqueIndex("idx_contacts_account_stable").on(
      table.accountId,
      table.stableId,
    ),
  }),
);

/** 会话表 */
export const conversations = sqliteTable(
  "conversations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    conversationId: text("conversation_id").notNull().unique(),
    stableId: text("stable_id"),
    type: text("type").notNull(),
    name: text("name").notNull(),
    avatar: text("avatar"),
    memberCount: integer("member_count").default(1),
    messageCount: integer("message_count").default(0),
    lastMessageAt: integer("last_message_at", { mode: "timestamp" }),
    backupStatus: text("backup_status").default("complete"),
    isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
    sourceId: text("source_id"),
    sourceHash: text("source_hash"),
    rawPayload: text("raw_payload"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    accountIdx: index("idx_conversations_account").on(table.accountId),
    accountTypeDateIdx: index("idx_conversations_account_type_date").on(
      table.accountId,
      table.type,
      table.lastMessageAt,
    ),
    lastMessageIdx: index("idx_conversations_last_message").on(
      table.lastMessageAt,
    ),
    stableIdx: uniqueIndex("idx_conversations_stable").on(table.stableId),
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
    stableId: text("stable_id"),
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
    sourceId: text("source_id"),
    sourceHash: text("source_hash"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    conversationIdx: index("idx_messages_conversation").on(
      table.conversationId,
    ),
    timestampIdx: index("idx_messages_timestamp").on(table.timestamp),
    typeIdx: index("idx_messages_type").on(table.type),
    senderIdx: index("idx_messages_sender").on(table.senderWxid),
    conversationDateTypeSenderIdx: index(
      "idx_messages_conversation_date_type_sender",
    ).on(table.conversationId, table.timestamp, table.type, table.senderWxid),
    stableIdx: uniqueIndex("idx_messages_stable").on(table.stableId),
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
    stableId: text("stable_id"),
    type: text("type").notNull(),
    filename: text("filename"),
    fileSize: integer("file_size"),
    filePath: text("file_path"),
    checksum: text("checksum"),
    backupStatus: text("backup_status").default("complete"),
    sourceId: text("source_id"),
    sourceHash: text("source_hash"),
    rawPayload: text("raw_payload"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    messageIdx: index("idx_attachments_message").on(table.messageId),
    typeIdx: index("idx_attachments_type").on(table.type),
    typeStatusIdx: index("idx_attachments_type_status").on(
      table.type,
      table.backupStatus,
    ),
    stableIdx: uniqueIndex("idx_attachments_stable").on(table.stableId),
  }),
);

/** 备份任务表 */
export const backupTasks = sqliteTable(
  "backup_tasks",
  {
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
  },
  (table) => ({
    statusDateIdx: index("idx_backup_tasks_status_date").on(
      table.status,
      table.startedAt,
    ),
  }),
);

/** 导入任务表 */
export const importJobs = sqliteTable(
  "import_jobs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    archiveId: integer("archive_id").references(() => archives.id, {
      onDelete: "set null",
    }),
    status: text("status").notNull(),
    sourceType: text("source_type").notNull(),
    sourcePath: text("source_path"),
    summaryJson: text("summary_json"),
    warningCount: integer("warning_count").default(0),
    unknownTypeCount: integer("unknown_type_count").default(0),
    startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    statusDateIdx: index("idx_import_jobs_status_date").on(
      table.status,
      table.startedAt,
    ),
  }),
);

/** 导出任务表 */
export const exportJobs = sqliteTable(
  "export_jobs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    archiveId: integer("archive_id").references(() => archives.id, {
      onDelete: "set null",
    }),
    status: text("status").notNull(),
    format: text("format").notNull(),
    targetPath: text("target_path"),
    summaryJson: text("summary_json"),
    warningCount: integer("warning_count").default(0),
    startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    statusDateIdx: index("idx_export_jobs_status_date").on(
      table.status,
      table.startedAt,
    ),
  }),
);

/** 任务日志表 */
export const taskLogs = sqliteTable(
  "task_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    taskId: integer("task_id").references(() => backupTasks.id, {
      onDelete: "set null",
    }),
    importJobId: integer("import_job_id").references(() => importJobs.id, {
      onDelete: "set null",
    }),
    exportJobId: integer("export_job_id").references(() => exportJobs.id, {
      onDelete: "set null",
    }),
    level: text("level").notNull(),
    message: text("message").notNull(),
    metadataJson: text("metadata_json"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    taskDateIdx: index("idx_task_logs_task_date").on(
      table.taskId,
      table.createdAt,
    ),
    importJobDateIdx: index("idx_task_logs_import_job_date").on(
      table.importJobId,
      table.createdAt,
    ),
  }),
);

/** 恢复点表 */
export const restorePoints = sqliteTable(
  "restore_points",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    archiveId: integer("archive_id").references(() => archives.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    status: text("status").notNull().default("available"),
    summaryJson: text("summary_json"),
    riskJson: text("risk_json"),
    checkedAt: integer("checked_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    archiveDateIdx: index("idx_restore_points_archive_date").on(
      table.archiveId,
      table.createdAt,
    ),
  }),
);

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
