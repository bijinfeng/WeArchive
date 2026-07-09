import { getDatabase, schema } from "@we-archive/core/database";
import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";

/**
 * 注册所有 API 路由（对应桌面端的 IPC 通道）
 */
export function registerRoutes(server: FastifyInstance) {
  const withFallback = async <T>(handler: () => Promise<T>, fallback: T) => {
    try {
      return await handler();
    } catch (error) {
      server.log.warn({ error }, "API fallback returned");
      return fallback;
    }
  };

  // ============ Database API ============

  // 获取账号列表
  server.get("/api/accounts", async () => {
    return withFallback(
      () => getDatabase().select().from(schema.accounts).limit(10),
      [],
    );
  });

  // 获取数据统计
  server.get("/api/stats", async () => {
    return withFallback(
      async () => {
        const db = getDatabase();
        const conversations = await db.select().from(schema.conversations);
        const messages = await db.select().from(schema.messages);
        const attachments = await db.select().from(schema.attachments);

        return {
          conversationCount: conversations.length,
          messageCount: messages.length,
          attachmentCount: attachments.length,
          storageSize: attachments.reduce(
            (total, attachment) => total + (attachment.fileSize ?? 0),
            0,
          ),
          todayNewCount: 0,
          pendingIssues: 0,
        };
      },
      {
        conversationCount: 0,
        messageCount: 0,
        attachmentCount: 0,
        storageSize: 0,
        todayNewCount: 0,
        pendingIssues: 0,
      },
    );
  });

  // 获取会话列表（分页）
  server.get<{
    Querystring: { offset?: string; limit?: string; search?: string };
  }>("/api/conversations", async (request) => {
    const offset = Number(request.query.offset) || 0;
    const limit = Number(request.query.limit) || 20;
    // const search = request.query.search

    // TODO: 实现搜索过滤
    return withFallback(
      async () => {
        const db = getDatabase();
        const conversations = await db
          .select()
          .from(schema.conversations)
          .limit(limit)
          .offset(offset);

        return {
          items: conversations,
          total: conversations.length,
        };
      },
      {
        items: [],
        total: 0,
      },
    );
  });

  // ============ Backup API ============

  // 获取备份任务列表
  server.get("/api/backup/tasks", async () => {
    return withFallback(
      () => getDatabase().select().from(schema.backupTasks).limit(10),
      [],
    );
  });

  // 开始备份
  server.post("/api/backup/start", async () => {
    // TODO: 实现备份任务创建
    return {
      id: Date.now(),
      status: "waiting",
      message: "Backup task created",
    };
  });

  // ============ Settings API ============

  // 获取设置
  server.get<{
    Querystring: { key: string };
  }>("/api/settings", async (request) => {
    const { key } = request.query;
    return withFallback(async () => {
      const db = getDatabase();
      const result = await db
        .select()
        .from(schema.settings)
        .where(eq(schema.settings.key, key))
        .limit(1);

      return result[0]?.value || null;
    }, null);
  });

  // 保存设置
  server.post<{
    Body: { key: string; value: string };
  }>("/api/settings", async (request) => {
    return withFallback(
      async () => {
        const { key, value } = request.body;
        await getDatabase()
          .insert(schema.settings)
          .values({
            key,
            value,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: schema.settings.key,
            set: {
              value,
              updatedAt: new Date(),
            },
          });

        return { success: true };
      },
      { success: false },
    );
  });

  // Health check
  server.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });
}
