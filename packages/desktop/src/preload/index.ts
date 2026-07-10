import type { NormalizedArchiveInput } from "@we-archive/core/archive";
import type { TaskProgressEvent } from "@we-archive/core/services";
import type {
  BackupTask,
  ConversationDetail,
  ConversationListParams,
  ConversationListResult,
  CreateTaskInput,
  ExecuteExportInput,
  ExecuteExportResult,
  ExecuteImportInput,
  ExecuteImportResult,
  ExportDraftInput,
  ExportDraftPlan,
  ImportDraftPlan,
  MessageListParams,
  MessageListResult,
  RestoreExecutionResult,
  RestorePointSummary,
  RestoreStrategyInput,
  RestoreStrategyPreview,
  SettingWriteResult,
  TaskDetail,
  TaskLog,
  TaskLogListParams,
  WeArchiveHomeData,
} from "@we-archive/core/types";
import type { IpcRendererEvent } from "electron";
import { contextBridge, ipcRenderer } from "electron";

// API 接口定义
export interface ElectronAPI {
  runtime: {
    platform: NodeJS.Platform;
  };

  windowControls: {
    minimize: () => void;
    toggleMaximize: () => void;
    close: () => void;
  };

  overview: {
    getData: () => Promise<WeArchiveHomeData>;
    seedFixture: () => Promise<{ seeded: boolean }>;
  };

  conversations: {
    list: (params: ConversationListParams) => Promise<ConversationListResult>;
    getDetail: (conversationId: string | number) => Promise<ConversationDetail>;
  };

  messages: {
    list: (params: MessageListParams) => Promise<MessageListResult>;
  };

  tasks: {
    list: () => Promise<BackupTask[]>;
    create: (input?: Partial<CreateTaskInput>) => Promise<BackupTask>;
    start: (taskId: number) => Promise<BackupTask>;
    pause: (taskId: number) => Promise<BackupTask>;
    resume: (taskId: number) => Promise<BackupTask>;
    cancel: (taskId: number) => Promise<BackupTask>;
    retry: (taskId: number) => Promise<BackupTask>;
    getDetail: (taskId: number) => Promise<TaskDetail>;
    listLogs: (params?: TaskLogListParams) => Promise<TaskLog[]>;
    onProgress: (callback: (event: TaskProgressEvent) => void) => () => void;
  };

  transfer: {
    planImport: (input: NormalizedArchiveInput) => Promise<ImportDraftPlan>;
    planExport: (input: ExportDraftInput) => Promise<ExportDraftPlan>;
    executeImport: (input?: ExecuteImportInput) => Promise<ExecuteImportResult>;
    executeExport: (input: ExecuteExportInput) => Promise<ExecuteExportResult>;
  };

  settings: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: unknown) => Promise<SettingWriteResult>;
  };

  restore: {
    listPoints: () => Promise<RestorePointSummary[]>;
    checkPoint: (restorePointId: number) => Promise<RestorePointSummary | null>;
    previewStrategy: (
      input: RestoreStrategyInput,
    ) => Promise<RestoreStrategyPreview>;
    execute: (input: RestoreStrategyInput) => Promise<RestoreExecutionResult>;
  };

  file: {
    selectFile: (options?: {
      title?: string;
      filters?: Array<{ name: string; extensions: string[] }>;
    }) => Promise<string | null>;
    selectDirectory: (title?: string) => Promise<string | null>;
    isReadable: (path: string) => Promise<boolean>;
    isWritable: (path: string) => Promise<boolean>;
    getSize: (path: string) => Promise<number>;
    getDirectorySize: (path: string) => Promise<number>;
    getAvailableSpace: (path: string) => Promise<number>;
  };
}

// 暴露 API 到渲染进程
const api: ElectronAPI = {
  runtime: {
    platform: process.platform,
  },

  windowControls: {
    minimize: () => ipcRenderer.send("window:minimize"),
    toggleMaximize: () => ipcRenderer.send("window:toggleMaximize"),
    close: () => ipcRenderer.send("window:close"),
  },

  overview: {
    getData: () => ipcRenderer.invoke("overview:getData"),
    seedFixture: () => ipcRenderer.invoke("overview:seedFixture"),
  },

  conversations: {
    list: (params) => ipcRenderer.invoke("conversations:list", params),
    getDetail: (conversationId) =>
      ipcRenderer.invoke("conversations:getDetail", conversationId),
  },

  messages: {
    list: (params) => ipcRenderer.invoke("messages:list", params),
  },

  tasks: {
    list: () => ipcRenderer.invoke("tasks:list"),
    create: (input) => ipcRenderer.invoke("tasks:create", input),
    start: (taskId) => ipcRenderer.invoke("tasks:start", taskId),
    pause: (taskId) => ipcRenderer.invoke("tasks:pause", taskId),
    resume: (taskId) => ipcRenderer.invoke("tasks:resume", taskId),
    cancel: (taskId) => ipcRenderer.invoke("tasks:cancel", taskId),
    retry: (taskId) => ipcRenderer.invoke("tasks:retry", taskId),
    getDetail: (taskId) => ipcRenderer.invoke("tasks:getDetail", taskId),
    listLogs: (params) => ipcRenderer.invoke("tasks:listLogs", params),
    onProgress: (callback) => {
      const handler = (_event: IpcRendererEvent, data: TaskProgressEvent) =>
        callback(data);
      ipcRenderer.on("task:progress", handler);
      return () => {
        ipcRenderer.removeListener("task:progress", handler);
      };
    },
  },

  transfer: {
    planImport: (input) => ipcRenderer.invoke("transfer:planImport", input),
    planExport: (input) => ipcRenderer.invoke("transfer:planExport", input),
    executeImport: (input) =>
      ipcRenderer.invoke("transfer:executeImport", input),
    executeExport: (input) =>
      ipcRenderer.invoke("transfer:executeExport", input),
  },

  settings: {
    get: (key) => ipcRenderer.invoke("settings:get", key),
    set: (key, value) => ipcRenderer.invoke("settings:set", key, value),
  },

  restore: {
    listPoints: () => ipcRenderer.invoke("restore:listPoints"),
    checkPoint: (restorePointId) =>
      ipcRenderer.invoke("restore:checkPoint", restorePointId),
    previewStrategy: (input) =>
      ipcRenderer.invoke("restore:previewStrategy", input),
    execute: (input) => ipcRenderer.invoke("restore:execute", input),
  },

  file: {
    selectFile: (options) => ipcRenderer.invoke("file:selectFile", options),
    selectDirectory: (title) =>
      ipcRenderer.invoke("file:selectDirectory", title),
    isReadable: (path) => ipcRenderer.invoke("file:isReadable", path),
    isWritable: (path) => ipcRenderer.invoke("file:isWritable", path),
    getSize: (path) => ipcRenderer.invoke("file:getSize", path),
    getDirectorySize: (path) =>
      ipcRenderer.invoke("file:getDirectorySize", path),
    getAvailableSpace: (path) =>
      ipcRenderer.invoke("file:getAvailableSpace", path),
  },
};

if (process.env.NODE_ENV === "development") {
  contextBridge.exposeInMainWorld("api", api);
}

contextBridge.exposeInMainWorld("electron", api);
