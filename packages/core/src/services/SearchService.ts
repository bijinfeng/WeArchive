import { load } from "@node-rs/jieba";
import { getSqlite } from "../database";

type SqlQueryParam = string | number;

interface MessageSearchRow {
  id: number;
  content: string;
  senderName: string;
  timestamp: string | number | Date;
  conversationId: number;
  rank: number;
}

interface MessageSearchItem extends Omit<MessageSearchRow, "timestamp"> {
  timestamp: Date;
}

interface AdvancedSearchRow extends MessageSearchRow {
  senderWxid: string;
  type: string;
}

interface AdvancedSearchItem extends Omit<AdvancedSearchRow, "timestamp"> {
  timestamp: Date;
}

/**
 * 搜索服务 - FTS5 全文搜索
 */
export class SearchService {
  private jiebaLoaded = false;

  /**
   * 初始化 jieba 分词器
   */
  async init() {
    if (this.jiebaLoaded) return;
    await load();
    this.jiebaLoaded = true;
  }

  /**
   * 分词
   */
  private segment(text: string): string[] {
    if (!this.jiebaLoaded) {
      throw new Error("Jieba not loaded. Call init() first.");
    }
    const jieba = require("@node-rs/jieba");
    return jieba.cut(text, false); // false = 精确模式
  }

  /**
   * 搜索消息（全文搜索）
   */
  async searchMessages(params: {
    query: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    items: MessageSearchItem[];
    total: number;
  }> {
    const { query, limit = 20, offset = 0 } = params;

    if (!this.jiebaLoaded) {
      await this.init();
    }

    // 分词
    const keywords = this.segment(query);
    const ftsQuery = keywords.join(" ");

    const sqlite = getSqlite();

    // FTS5 搜索
    const items = sqlite
      .prepare(
        `
      SELECT
        m.id,
        m.content,
        m.sender_name as senderName,
        m.timestamp,
        m.conversation_id as conversationId,
        fts.rank
      FROM messages_fts fts
      JOIN messages m ON fts.rowid = m.id
      WHERE messages_fts MATCH ?
      ORDER BY fts.rank
      LIMIT ? OFFSET ?
    `,
      )
      .all(ftsQuery, limit, offset) as MessageSearchRow[];

    // 计算总数
    const countResult = sqlite
      .prepare(
        `
      SELECT COUNT(*) as total
      FROM messages_fts
      WHERE messages_fts MATCH ?
    `,
      )
      .get(ftsQuery) as { total: number };

    return {
      items: items.map((item) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      })),
      total: countResult.total,
    };
  }

  /**
   * 高级搜索（支持筛选）
   */
  async advancedSearch(params: {
    query: string;
    conversationId?: number;
    senderWxid?: string;
    startDate?: Date;
    endDate?: Date;
    messageType?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    items: AdvancedSearchItem[];
    total: number;
  }> {
    const { query, limit = 20, offset = 0 } = params;

    if (!this.jiebaLoaded) {
      await this.init();
    }

    // 分词
    const keywords = this.segment(query);
    const ftsQuery = keywords.join(" ");

    const sqlite = getSqlite();

    // 构建 WHERE 条件
    const conditions: string[] = ["messages_fts MATCH ?"];
    const args: SqlQueryParam[] = [ftsQuery];

    if (params.conversationId) {
      conditions.push("m.conversation_id = ?");
      args.push(params.conversationId);
    }

    if (params.senderWxid) {
      conditions.push("m.sender_wxid = ?");
      args.push(params.senderWxid);
    }

    if (params.startDate) {
      conditions.push("m.timestamp >= ?");
      args.push(params.startDate.getTime());
    }

    if (params.endDate) {
      conditions.push("m.timestamp <= ?");
      args.push(params.endDate.getTime());
    }

    if (params.messageType) {
      conditions.push("m.type = ?");
      args.push(params.messageType);
    }

    const whereClause = conditions.join(" AND ");

    // 查询
    const items = sqlite
      .prepare(
        `
      SELECT
        m.id,
        m.content,
        m.sender_name as senderName,
        m.sender_wxid as senderWxid,
        m.type,
        m.timestamp,
        m.conversation_id as conversationId,
        fts.rank
      FROM messages_fts fts
      JOIN messages m ON fts.rowid = m.id
      WHERE ${whereClause}
      ORDER BY fts.rank
      LIMIT ? OFFSET ?
    `,
      )
      .all(...args, limit, offset) as AdvancedSearchRow[];

    // 计算总数
    const countResult = sqlite
      .prepare(
        `
      SELECT COUNT(*) as total
      FROM messages_fts fts
      JOIN messages m ON fts.rowid = m.id
      WHERE ${whereClause}
    `,
      )
      .get(...args) as { total: number };

    return {
      items: items.map((item) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      })),
      total: countResult.total,
    };
  }
}
