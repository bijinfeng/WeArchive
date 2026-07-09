import type { TaskProgressEvent } from "@we-archive/core/services";
import type {
  Account,
  BackupTask,
  Conversation,
  DataStats,
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

  // 数据库
  database: {
    getAccount: () => Promise<Account | null>;
    getStats: () => Promise<DataStats>;
    getConversations: (params: { limit?: number; offset?: number }) => Promise<{
      items: Conversation[];
      total: number;
    }>;
  };

  // 备份任务
  backup: {
    getTasks: () => Promise<BackupTask[]>;
    start: (params: {
      name: string;
      accountId: number;
      savePath: string;
    }) => Promise<BackupTask>;
    pause: (taskId: number) => Promise<void>;
    resume: (taskId: number) => Promise<void>;
    cancel: (taskId: number) => Promise<void>;
    onProgress: (callback: (event: TaskProgressEvent) => void) => () => void;
  };

  // 文件系统
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

  database: {
    getAccount: () => ipcRenderer.invoke("database:getAccount"),
    getStats: () => ipcRenderer.invoke("database:getStats"),
    getConversations: (params) =>
      ipcRenderer.invoke("database:getConversations", params),
  },

  backup: {
    getTasks: () => ipcRenderer.invoke("backup:getTasks"),
    start: (params) => ipcRenderer.invoke("backup:start", params),
    pause: (taskId) => ipcRenderer.invoke("backup:pause", taskId),
    resume: (taskId) => ipcRenderer.invoke("backup:resume", taskId),
    cancel: (taskId) => ipcRenderer.invoke("backup:cancel", taskId),
    onProgress: (callback) => {
      const handler = (_event: IpcRendererEvent, data: TaskProgressEvent) =>
        callback(data);
      ipcRenderer.on("task:progress", handler);
      // 返回清理函数
      return () => {
        ipcRenderer.removeListener("task:progress", handler);
      };
    },
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

// 在开发环境暴露给 window，方便调试
if (process.env.NODE_ENV === "development") {
  contextBridge.exposeInMainWorld("api", api);
}

// 暴露给渲染进程
contextBridge.exposeInMainWorld("electron", api);
