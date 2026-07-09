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

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      conversation_id TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      member_count INTEGER DEFAULT 1,
      message_count INTEGER DEFAULT 0,
      last_message_at INTEGER,
      backup_status TEXT DEFAULT 'complete',
      is_favorite INTEGER DEFAULT 0,
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
      message_id TEXT,
      sender_wxid TEXT,
      sender_name TEXT,
      type TEXT NOT NULL,
      content TEXT,
      timestamp INTEGER NOT NULL,
      has_attachment INTEGER DEFAULT 0,
      raw_payload TEXT,
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
      type TEXT NOT NULL,
      filename TEXT,
      file_size INTEGER,
      file_path TEXT,
      checksum TEXT,
      backup_status TEXT DEFAULT 'complete',
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

  initFts(sqlite);
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
