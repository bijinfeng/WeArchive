import type { NormalizedArchiveInput } from "@we-archive/core/archive";
import { getSqlite } from "@we-archive/core/database";
import {
  cancelTask,
  checkRestorePoint,
  createFailedTask,
  createTask,
  executeExport,
  executeFixtureImport,
  executeRestore,
  getConversationDetail,
  getOverviewData,
  getSetting,
  getTaskDetail,
  listConversations,
  listMessages,
  listRestorePoints,
  listTaskLogs,
  listTasks,
  pauseTask,
  planExportDraft,
  planImportDraft,
  previewRestoreStrategy,
  resumeTask,
  retryTask,
  seedFixtureArchiveIfEmpty,
  setSetting,
  startTask,
} from "@we-archive/core/repositories";
import type {
  ConversationListParams,
  CreateTaskInput,
  ExecuteExportInput,
  ExecuteImportInput,
  ExportDraftInput,
  MessageListParams,
  RestoreStrategyInput,
  TaskLogListParams,
} from "@we-archive/core/types";
import type { FastifyInstance } from "fastify";

/**
 * 注册所有 API 路由（对应桌面端的 IPC 通道）
 */
export function registerRoutes(server: FastifyInstance) {
  server.post("/api/dev/seed-fixture", async () => ({
    seeded: await seedFixtureArchiveIfEmpty(),
  }));

  server.post("/api/dev/seed-failed-task", async () =>
    createFailedTask({
      accountId: resolveDefaultAccountId(),
      savePath: "/tmp/wearchive-qa-failed",
      currentStep: "QA 失败任务：连接中断",
      progress: 34,
      errorCount: 2,
      warningCount: 1,
    }),
  );

  server.get("/api/overview", async () => getOverviewData());

  server.get<{
    Querystring: ConversationListParams & { search?: string };
  }>("/api/conversations", async (request) => {
    const params: ConversationListParams = {
      ...request.query,
      limit: toNumber(request.query.limit, 20),
      offset: toNumber(request.query.offset, 0),
    };
    const query = request.query.query ?? request.query.search;

    if (query) {
      params.query = query;
    }

    return listConversations(params);
  });

  server.get<{
    Params: { conversationId: string };
  }>("/api/conversations/:conversationId", async (request) =>
    getConversationDetail(request.params.conversationId),
  );

  server.get<{
    Querystring: MessageListParams;
  }>("/api/messages", async (request) =>
    listMessages({
      ...request.query,
      limit: toNumber(request.query.limit, 50),
    }),
  );

  server.get("/api/tasks", async () => listTasks());

  server.post<{
    Body: Partial<CreateTaskInput>;
  }>("/api/tasks", async (request) =>
    createTask({
      accountId: request.body.accountId ?? resolveDefaultAccountId(),
      savePath: request.body.savePath ?? "",
      currentStep: request.body.currentStep ?? "等待备份",
    }),
  );

  server.post<{
    Params: { taskId: string };
  }>("/api/tasks/:taskId/start", async (request) =>
    startTask(Number(request.params.taskId)),
  );

  server.post<{
    Params: { taskId: string };
  }>("/api/tasks/:taskId/pause", async (request) =>
    pauseTask(Number(request.params.taskId)),
  );

  server.post<{
    Params: { taskId: string };
  }>("/api/tasks/:taskId/resume", async (request) =>
    resumeTask(Number(request.params.taskId)),
  );

  server.post<{
    Params: { taskId: string };
  }>("/api/tasks/:taskId/cancel", async (request) =>
    cancelTask(Number(request.params.taskId)),
  );

  server.post<{
    Params: { taskId: string };
  }>("/api/tasks/:taskId/retry", async (request) =>
    retryTask(Number(request.params.taskId)),
  );

  server.get<{
    Params: { taskId: string };
  }>("/api/tasks/:taskId", async (request) =>
    getTaskDetail(Number(request.params.taskId)),
  );

  server.get<{
    Querystring: TaskLogListParams;
  }>("/api/task-logs", async (request) => listTaskLogs(request.query));

  server.post<{
    Body: NormalizedArchiveInput;
  }>("/api/transfer/import/plan", async (request) =>
    planImportDraft(request.body),
  );

  server.post<{
    Body: ExportDraftInput;
  }>("/api/transfer/export/plan", async (request) =>
    planExportDraft(request.body),
  );

  server.post<{
    Body: ExecuteImportInput;
  }>("/api/transfer/import/execute", async (request) =>
    executeFixtureImport(request.body),
  );

  server.post<{
    Body: ExecuteExportInput;
  }>("/api/transfer/export/execute", async (request) =>
    executeExport(request.body),
  );

  server.get<{
    Querystring: { key: string };
  }>("/api/settings", async (request) => getSetting(request.query.key));

  server.post<{
    Body: { key: string; value: unknown };
  }>("/api/settings", async (request) =>
    setSetting(request.body.key, request.body.value),
  );

  server.get("/api/restore/points", async () => listRestorePoints());

  server.get<{
    Params: { restorePointId: string };
  }>("/api/restore/points/:restorePointId", async (request) =>
    checkRestorePoint(Number(request.params.restorePointId)),
  );

  server.post<{
    Body: RestoreStrategyInput;
  }>("/api/restore/preview", async (request) =>
    previewRestoreStrategy(request.body),
  );

  server.post<{
    Body: RestoreStrategyInput;
  }>("/api/restore/execute", async (request) => executeRestore(request.body));

  // 兼容旧 frontend API，后续页面切到 shared adapter 后可以删除。
  server.get("/api/accounts", async () => {
    const overview = await getOverviewData();
    return overview.account ? [overview.account] : [];
  });
  server.get("/api/stats", async () => (await getOverviewData()).stats);
  server.get("/api/backup/tasks", async () => listTasks());
  server.post("/api/backup/start", async () =>
    createTask({
      accountId: resolveDefaultAccountId(),
      savePath: "",
      currentStep: "等待备份",
    }),
  );

  server.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });
}

function toNumber(value: unknown, fallback: number): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function resolveDefaultAccountId(): number {
  const row = getSqlite()
    .prepare("SELECT id FROM accounts ORDER BY last_backup_at DESC LIMIT 1")
    .get() as { id: number } | undefined;

  if (!row) {
    throw new Error("No account is available for task creation");
  }

  return row.id;
}
