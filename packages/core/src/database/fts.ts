import type Database from "better-sqlite3";

/**
 * 初始化 FTS5 全文搜索虚拟表和触发器
 * Drizzle 不直接支持 FTS5，用 raw SQL 实现
 */
export function initFts(sqlite: Database.Database) {
  // 创建 FTS5 虚拟表
  sqlite.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
      content,
      sender_name,
      content='messages',
      content_rowid='id',
      tokenize='unicode61'
    );
  `);

  // 插入触发器
  sqlite.exec(`
    CREATE TRIGGER IF NOT EXISTS messages_ai AFTER INSERT ON messages BEGIN
      INSERT INTO messages_fts(rowid, content, sender_name)
      VALUES (new.id, new.content, new.sender_name);
    END;
  `);

  // 更新触发器
  sqlite.exec(`
    CREATE TRIGGER IF NOT EXISTS messages_au AFTER UPDATE ON messages BEGIN
      UPDATE messages_fts SET
        content = new.content,
        sender_name = new.sender_name
      WHERE rowid = new.id;
    END;
  `);

  // 删除触发器
  sqlite.exec(`
    CREATE TRIGGER IF NOT EXISTS messages_ad AFTER DELETE ON messages BEGIN
      DELETE FROM messages_fts WHERE rowid = old.id;
    END;
  `);
}
