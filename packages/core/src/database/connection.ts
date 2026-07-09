import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
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

  sqliteInstance = new Database(dbPath);

  // 启用 WAL 模式（更好的并发性能）
  sqliteInstance.pragma("journal_mode = WAL");

  // 启用外键约束
  sqliteInstance.pragma("foreign_keys = ON");

  dbInstance = drizzle(sqliteInstance, { schema });

  return dbInstance;
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
