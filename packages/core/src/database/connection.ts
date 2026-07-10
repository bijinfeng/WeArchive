import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { initFts } from "./fts";
import * as schema from "./schema";

type SqliteDatabase = InstanceType<typeof Database>;

let dbInstance: ReturnType<typeof drizzle> | null = null;
let sqliteInstance: SqliteDatabase | null = null;

/**
 * 初始化数据库连接
 */
export function initDatabase(dbPath: string) {
  if (dbInstance) {
    return dbInstance;
  }

  mkdirSync(dirname(dbPath), { recursive: true });
  sqliteInstance = new Database(dbPath);

  // 启用 WAL 模式（更好的并发性能）
  sqliteInstance.pragma("journal_mode = WAL");

  // 启用外键约束
  sqliteInstance.pragma("foreign_keys = ON");

  initSchema(sqliteInstance);

  dbInstance = drizzle(sqliteInstance, { schema });

  return dbInstance;
}

function initSchema(sqlite: SqliteDatabase): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wxid TEXT NOT NULL UNIQUE,
      nickname TEXT,
      avatar TEXT,
      device_source TEXT,
      last_backup_at INTEGER,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS archives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      archive_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      source_type TEXT NOT NULL,
      source_version TEXT,
      imported_at INTEGER,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      stable_id TEXT NOT NULL,
      wxid TEXT NOT NULL,
      nickname TEXT NOT NULL,
      avatar TEXT,
      type TEXT NOT NULL DEFAULT 'personal',
      remark TEXT,
      source_id TEXT,
      source_hash TEXT,
      raw_payload TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_contacts_account
      ON contacts(account_id);
    CREATE INDEX IF NOT EXISTS idx_contacts_wxid
      ON contacts(wxid);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_account_stable
      ON contacts(account_id, stable_id);

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      conversation_id TEXT NOT NULL UNIQUE,
      stable_id TEXT,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      member_count INTEGER DEFAULT 1,
      message_count INTEGER DEFAULT 0,
      last_message_at INTEGER,
      backup_status TEXT DEFAULT 'complete',
      is_favorite INTEGER DEFAULT 0,
      source_id TEXT,
      source_hash TEXT,
      raw_payload TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_conversations_account
      ON conversations(account_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_last_message
      ON conversations(last_message_at);

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      stable_id TEXT,
      message_id TEXT,
      sender_wxid TEXT,
      sender_name TEXT,
      type TEXT NOT NULL,
      content TEXT,
      timestamp INTEGER NOT NULL,
      has_attachment INTEGER DEFAULT 0,
      raw_payload TEXT,
      source_id TEXT,
      source_hash TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_messages_conversation
      ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_messages_timestamp
      ON messages(timestamp);
    CREATE INDEX IF NOT EXISTS idx_messages_type
      ON messages(type);
    CREATE INDEX IF NOT EXISTS idx_messages_sender
      ON messages(sender_wxid);

    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id INTEGER NOT NULL,
      stable_id TEXT,
      type TEXT NOT NULL,
      filename TEXT,
      file_size INTEGER,
      file_path TEXT,
      checksum TEXT,
      backup_status TEXT DEFAULT 'complete',
      source_id TEXT,
      source_hash TEXT,
      raw_payload TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_attachments_message
      ON attachments(message_id);
    CREATE INDEX IF NOT EXISTS idx_attachments_type
      ON attachments(type);

    CREATE TABLE IF NOT EXISTS backup_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      progress INTEGER DEFAULT 0,
      current_step TEXT,
      started_at INTEGER NOT NULL,
      completed_at INTEGER,
      elapsed_time INTEGER DEFAULT 0,
      save_path TEXT NOT NULL,
      error_count INTEGER DEFAULT 0,
      warning_count INTEGER DEFAULT 0,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_backup_tasks_status_date
      ON backup_tasks(status, started_at);

    CREATE TABLE IF NOT EXISTS import_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      archive_id INTEGER,
      status TEXT NOT NULL,
      source_type TEXT NOT NULL,
      source_path TEXT,
      summary_json TEXT,
      warning_count INTEGER DEFAULT 0,
      unknown_type_count INTEGER DEFAULT 0,
      started_at INTEGER NOT NULL,
      completed_at INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (archive_id) REFERENCES archives(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_import_jobs_status_date
      ON import_jobs(status, started_at);

    CREATE TABLE IF NOT EXISTS export_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      archive_id INTEGER,
      status TEXT NOT NULL,
      format TEXT NOT NULL,
      target_path TEXT,
      summary_json TEXT,
      warning_count INTEGER DEFAULT 0,
      started_at INTEGER NOT NULL,
      completed_at INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (archive_id) REFERENCES archives(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_export_jobs_status_date
      ON export_jobs(status, started_at);

    CREATE TABLE IF NOT EXISTS task_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER,
      import_job_id INTEGER,
      export_job_id INTEGER,
      level TEXT NOT NULL,
      message TEXT NOT NULL,
      metadata_json TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (task_id) REFERENCES backup_tasks(id) ON DELETE SET NULL,
      FOREIGN KEY (import_job_id) REFERENCES import_jobs(id) ON DELETE SET NULL,
      FOREIGN KEY (export_job_id) REFERENCES export_jobs(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_task_logs_task_date
      ON task_logs(task_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_task_logs_import_job_date
      ON task_logs(import_job_id, created_at);

    CREATE TABLE IF NOT EXISTS restore_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      archive_id INTEGER,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'available',
      summary_json TEXT,
      risk_json TEXT,
      checked_at INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (archive_id) REFERENCES archives(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_restore_points_archive_date
      ON restore_points(archive_id, created_at);

    CREATE TABLE IF NOT EXISTS backup_watermarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL UNIQUE,
      last_message_timestamp INTEGER NOT NULL,
      last_message_id TEXT,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS backup_checkpoints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      conversation_id INTEGER NOT NULL,
      last_processed_message_id TEXT,
      processed_count INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (task_id) REFERENCES backup_tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  ensureColumn(sqlite, "conversations", "stable_id", "TEXT");
  ensureColumn(sqlite, "conversations", "source_id", "TEXT");
  ensureColumn(sqlite, "conversations", "source_hash", "TEXT");
  ensureColumn(sqlite, "conversations", "raw_payload", "TEXT");
  ensureColumn(sqlite, "messages", "stable_id", "TEXT");
  ensureColumn(sqlite, "messages", "source_id", "TEXT");
  ensureColumn(sqlite, "messages", "source_hash", "TEXT");
  ensureColumn(sqlite, "attachments", "stable_id", "TEXT");
  ensureColumn(sqlite, "attachments", "source_id", "TEXT");
  ensureColumn(sqlite, "attachments", "source_hash", "TEXT");
  ensureColumn(sqlite, "attachments", "raw_payload", "TEXT");

  sqlite.exec(`
    CREATE INDEX IF NOT EXISTS idx_conversations_account_type_date
      ON conversations(account_id, type, last_message_at);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_stable
      ON conversations(stable_id);
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_date_type_sender
      ON messages(conversation_id, timestamp, type, sender_wxid);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_stable
      ON messages(stable_id);
    CREATE INDEX IF NOT EXISTS idx_attachments_type_status
      ON attachments(type, backup_status);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_attachments_stable
      ON attachments(stable_id);
  `);

  initFts(sqlite);
}

function ensureColumn(
  sqlite: SqliteDatabase,
  tableName: string,
  columnName: string,
  definition: string,
): void {
  const columns = sqlite
    .prepare(`PRAGMA table_info(${tableName})`)
    .all() as Array<{ name: string }>;
  const exists = columns.some((column) => column.name === columnName);

  if (!exists) {
    sqlite.exec(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`,
    );
  }
}

/**
 * 获取数据库实例
 */
export function getDatabase() {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return dbInstance;
}

/**
 * 获取原始 SQLite 实例（用于 FTS5 等 raw SQL）
 */
export function getSqlite(): SqliteDatabase {
  if (!sqliteInstance) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return sqliteInstance;
}

/**
 * 关闭数据库连接
 */
export function closeDatabase() {
  if (sqliteInstance) {
    sqliteInstance.close();
    sqliteInstance = null;
    dbInstance = null;
  }
}
