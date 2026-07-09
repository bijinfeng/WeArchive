import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Conversation,
  WeArchiveOverviewAccount,
  WeArchiveOverviewTask,
  WeArchiveStatsInput,
} from "@we-archive/core/types";
import { normalizeOverviewStats } from "@we-archive/core/utils";

/**
 * API 适配器接口
 * 桌面端通过 IPC 实现，飞牛端通过 HTTP 实现
 */
export interface ApiAdapter {
  database: {
    getAccount: () => Promise<WeArchiveOverviewAccount | null>;
    getStats: () => Promise<WeArchiveStatsInput>;
    getConversations: (params: {
      offset: number;
      limit: number;
      search?: string;
    }) => Promise<{ items: Conversation[]; total: number }>;
  };
  backup: {
    getTasks: () => Promise<WeArchiveOverviewTask[]>;
    start: () => Promise<WeArchiveOverviewTask>;
  };
  settings: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: unknown) => Promise<boolean>;
  };
}

// 全局 API 实例（由宿主注入）
let apiInstance: ApiAdapter | null = null;

/**
 * 初始化 API 适配器
 */
export function initApiAdapter(adapter: ApiAdapter) {
  apiInstance = adapter;
}

/**
 * 获取 API 实例
 */
function getApi(): ApiAdapter {
  if (!apiInstance) {
    throw new Error(
      "API adapter not initialized. Call initApiAdapter() first.",
    );
  }
  return apiInstance;
}

/**
 * 获取当前账号
 */
export function useAccount() {
  return useQuery({
    queryKey: ["account"],
    queryFn: () => getApi().database.getAccount(),
  });
}

/**
 * 获取数据统计
 */
export function useDataStats() {
  return useQuery({
    queryKey: ["dataStats"],
    queryFn: async () =>
      normalizeOverviewStats(await getApi().database.getStats()),
  });
}

/**
 * 获取会话列表
 */
export function useConversations(params: {
  offset: number;
  limit: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ["conversations", params],
    queryFn: () => getApi().database.getConversations(params),
  });
}

/**
 * 获取备份任务列表
 */
export function useBackupTasks() {
  return useQuery({
    queryKey: ["backupTasks"],
    queryFn: () => getApi().backup.getTasks(),
    refetchInterval: 2000, // 每2秒刷新
  });
}

/**
 * 开始备份
 */
export function useStartBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => getApi().backup.start(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backupTasks"] });
    },
  });
}
