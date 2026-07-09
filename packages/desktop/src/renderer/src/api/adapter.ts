import type { TaskProgressEvent } from "@we-archive/core/services";
import type {
  Account,
  BackupTask,
  Conversation,
  DataStats,
} from "@we-archive/core/types";
import type { ApiAdapter } from "@we-archive/ui-shared/hooks";

// 从 preload 暴露的 API
declare global {
  interface Window {
    electron: {
      database: {
        getAccount: () => Promise<Account | null>;
        getStats: () => Promise<DataStats>;
        getConversations: (params: {
          limit?: number;
          offset?: number;
        }) => Promise<{ items: Conversation[]; total: number }>;
      };
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
        onProgress: (
          callback: (event: TaskProgressEvent) => void,
        ) => () => void;
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
    };
  }
}

/**
 * Electron IPC 适配器
 */
export const electronAdapter: ApiAdapter = {
  database: {
    getAccount: () => window.electron.database.getAccount(),
    getStats: () => window.electron.database.getStats(),
    async getConversations(params) {
      const result = await window.electron.database.getConversations({
        limit: params.limit,
        offset: params.offset,
      });
      return {
        items: result.items as Conversation[],
        total: result.total,
      };
    },
  },
  backup: {
    getTasks: () => window.electron.backup.getTasks(),
    start: () =>
      window.electron.backup.start({
        name: "手动备份",
        accountId: 1,
        savePath: "",
      }),
  },
  settings: {
    get: async () => null,
    set: async () => true,
  },
};
