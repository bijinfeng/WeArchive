import type { NormalizedArchiveInput } from "@we-archive/core/archive";
import {
  checkRestorePoint,
  executeExport,
  executeFixtureImport,
  executeRestore,
  getConversationDetail,
  getOverviewData,
  getSetting,
  listConversations,
  listMessages,
  listRestorePoints,
  listTaskLogs,
  planExportDraft,
  planImportDraft,
  previewRestoreStrategy,
  seedFixtureArchiveIfEmpty,
  setSetting,
} from "@we-archive/core/repositories";
import type {
  ConversationListParams,
  ExecuteExportInput,
  ExecuteImportInput,
  ExportDraftInput,
  MessageListParams,
  RestoreStrategyInput,
  TaskLogListParams,
} from "@we-archive/core/types";
import { ipcMain } from "electron";
import { services } from "../services";

/**
 * 注册共享数据域相关的 IPC handlers
 */
export function registerDatabaseHandlers(): void {
  ipcMain.handle("overview:getData", async () => {
    try {
      return await getOverviewData();
    } catch (error) {
      services.logService.error("Failed to get overview data", "IPC", error);
      throw error;
    }
  });

  ipcMain.handle("overview:seedFixture", async () => {
    try {
      return { seeded: await seedFixtureArchiveIfEmpty() };
    } catch (error) {
      services.logService.error("Failed to seed fixture", "IPC", error);
      throw error;
    }
  });

  ipcMain.handle(
    "conversations:list",
    async (_event, params: ConversationListParams = {}) => {
      try {
        return await listConversations(params);
      } catch (error) {
        services.logService.error("Failed to list conversations", "IPC", error);
        throw error;
      }
    },
  );

  ipcMain.handle(
    "conversations:getDetail",
    async (_event, conversationId: string | number) => {
      try {
        return await getConversationDetail(conversationId);
      } catch (error) {
        services.logService.error(
          "Failed to get conversation detail",
          "IPC",
          error,
        );
        throw error;
      }
    },
  );

  ipcMain.handle("messages:list", async (_event, params: MessageListParams) => {
    try {
      return await listMessages(params);
    } catch (error) {
      services.logService.error("Failed to list messages", "IPC", error);
      throw error;
    }
  });

  ipcMain.handle(
    "tasks:listLogs",
    async (_event, params: TaskLogListParams = {}) => {
      try {
        return await listTaskLogs(params);
      } catch (error) {
        services.logService.error("Failed to list task logs", "IPC", error);
        throw error;
      }
    },
  );

  ipcMain.handle(
    "transfer:planImport",
    async (_event, input: NormalizedArchiveInput) => {
      try {
        return await planImportDraft(input);
      } catch (error) {
        services.logService.error("Failed to plan import", "IPC", error);
        throw error;
      }
    },
  );

  ipcMain.handle(
    "transfer:planExport",
    async (_event, input: ExportDraftInput) => {
      try {
        return await planExportDraft(input);
      } catch (error) {
        services.logService.error("Failed to plan export", "IPC", error);
        throw error;
      }
    },
  );

  ipcMain.handle(
    "transfer:executeImport",
    async (_event, input: ExecuteImportInput = {}) => {
      try {
        return await executeFixtureImport(input);
      } catch (error) {
        services.logService.error("Failed to execute import", "IPC", error);
        throw error;
      }
    },
  );

  ipcMain.handle(
    "transfer:executeExport",
    async (_event, input: ExecuteExportInput) => {
      try {
        return await executeExport(input);
      } catch (error) {
        services.logService.error("Failed to execute export", "IPC", error);
        throw error;
      }
    },
  );

  ipcMain.handle("settings:get", async (_event, key: string) =>
    getSetting(key),
  );

  ipcMain.handle("settings:set", async (_event, key: string, value: unknown) =>
    setSetting(key, value),
  );

  ipcMain.handle("restore:listPoints", async () => listRestorePoints());

  ipcMain.handle("restore:checkPoint", async (_event, restorePointId: number) =>
    checkRestorePoint(restorePointId),
  );

  ipcMain.handle(
    "restore:previewStrategy",
    async (_event, input: RestoreStrategyInput) =>
      previewRestoreStrategy(input),
  );

  ipcMain.handle(
    "restore:execute",
    async (_event, input: RestoreStrategyInput) => executeRestore(input),
  );

  services.logService.info("Data IPC handlers registered", "IPC");
}
