import type {
  Account,
  BackupTask,
  Conversation,
  DataStats,
} from "../shared/types";

export interface WindowAPI {
  database: {
    getAccount: () => Promise<Account>;
    getStats: () => Promise<DataStats>;
    getConversations: (params: {
      offset: number;
      limit: number;
      search?: string;
    }) => Promise<{ items: Conversation[]; total: number }>;
  };
  backup: {
    getTasks: () => Promise<BackupTask[]>;
    start: () => Promise<BackupTask>;
  };
  settings: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: unknown) => Promise<boolean>;
  };
}

declare global {
  interface Window {
    api: WindowAPI;
  }
}
