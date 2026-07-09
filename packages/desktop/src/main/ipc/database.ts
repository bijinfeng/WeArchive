import { getDatabase, schema } from "@we-archive/core/database";
import type { Account, DataStats } from "@we-archive/core/types";
import { ipcMain } from "electron";
import { services } from "../services";

/**
 * 注册数据库相关的 IPC handlers
 */
export function registerDatabaseHandlers(): void {
  /**
   * 获取当前账号
   */
  ipcMain.handle("database:getAccount", async (): Promise<Account | null> => {
    try {
      const db = getDatabase();
      const [account] = await db.select().from(schema.accounts).limit(1);

      if (!account) return null;

      return {
        id: account.id,
        wxid: account.wxid,
        nickname: account.nickname,
        avatar: account.avatar || undefined,
        phone: account.phone || undefined,
        lastBackupAt: account.lastBackupAt || undefined,
      };
    } catch (error) {
      services.logService.error("Failed to get account", "IPC", error);
      throw error;
    }
  });

  /**
   * 获取数据统计
   */
  ipcMain.handle("database:getStats", async (): Promise<DataStats> => {
    try {
      const db = getDatabase();

      // 会话总数
      const [conversationCount] = await db
        .select({ count: schema.conversations.id })
        .from(schema.conversations);

      // 消息总数
      const [messageCount] = await db
        .select({ count: schema.messages.id })
        .from(schema.messages);

      // 附件总数
      const [attachmentCount] = await db
        .select({ count: schema.attachments.id })
        .from(schema.attachments);

      return {
        conversationCount: conversationCount?.count || 0,
        messageCount: messageCount?.count || 0,
        attachmentCount: attachmentCount?.count || 0,
        totalSize: 0, // TODO: 计算附件总大小
        todayMessages: 0, // TODO: 今日新增消息
        pendingIssues: 0, // TODO: 待处理问题
      };
    } catch (error) {
      services.logService.error("Failed to get stats", "IPC", error);
      throw error;
    }
  });

  /**
   * 获取会话列表
   */
  ipcMain.handle(
    "database:getConversations",
    async (_event, params: { limit?: number; offset?: number }) => {
      try {
        const { limit = 20, offset = 0 } = params;
        const db = getDatabase();

        const conversations = await db
          .select()
          .from(schema.conversations)
          .limit(limit)
          .offset(offset);

        const [countResult] = await db
          .select({ count: schema.conversations.id })
          .from(schema.conversations);

        return {
          items: conversations.map((c) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            avatar: c.avatar || undefined,
            memberCount: c.memberCount || undefined,
            lastMessageAt: c.lastMessageAt || undefined,
            lastMessagePreview: c.lastMessagePreview || undefined,
          })),
          total: countResult?.count || 0,
        };
      } catch (error) {
        services.logService.error("Failed to get conversations", "IPC", error);
        throw error;
      }
    },
  );

  services.logService.info("Database IPC handlers registered", "IPC");
}
