import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NormalizedArchiveInput } from "@we-archive/core/archive";
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
  WeArchiveOverviewData,
} from "@we-archive/core/types";
import { EMPTY_OVERVIEW_STATS } from "@we-archive/core/utils";

/**
 * API 适配器接口
 * 桌面端通过 IPC 实现，飞牛端通过 HTTP 实现
 */
export interface ApiAdapter {
  overview: {
    getData: () => Promise<WeArchiveHomeData>;
    seedFixture?: () => Promise<{ seeded: boolean }>;
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

export function getApiAdapter(): ApiAdapter {
  return getApi();
}

export function useOverviewData() {
  return useQuery({
    queryKey: ["overview"],
    queryFn: () => getApi().overview.getData(),
  });
}

/**
 * 获取当前账号
 */
export function useAccount() {
  return useQuery({
    queryKey: ["overview", "account"],
    queryFn: async () => (await getApi().overview.getData()).account,
  });
}

/**
 * 获取数据统计
 */
export function useDataStats() {
  return useQuery({
    queryKey: ["overview", "stats"],
    queryFn: async () =>
      (await getApi().overview.getData()).stats ?? EMPTY_OVERVIEW_STATS,
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
    queryFn: () => {
      const queryParams: ConversationListParams = {
        limit: params.limit,
        offset: params.offset,
      };

      if (params.search) {
        queryParams.query = params.search;
      }

      return getApi().conversations.list(queryParams);
    },
  });
}

export function useConversationList(params: ConversationListParams) {
  return useQuery({
    queryKey: ["conversations", params],
    queryFn: () => getApi().conversations.list(params),
  });
}

export function useConversationDetail(
  conversationId: string | number | null | undefined,
) {
  return useQuery({
    queryKey: ["conversationDetail", conversationId],
    queryFn: () =>
      getApi().conversations.getDetail(conversationId as string | number),
    enabled: conversationId !== null && conversationId !== undefined,
  });
}

export function useMessages(params: MessageListParams | undefined) {
  return useQuery({
    queryKey: ["messages", params],
    queryFn: () => getApi().messages.list(params as MessageListParams),
    enabled: params !== undefined,
  });
}

/**
 * 获取备份任务列表
 */
export function useBackupTasks() {
  return useQuery({
    queryKey: ["backupTasks"],
    queryFn: () => getApi().tasks.list(),
    refetchInterval: 2000, // 每2秒刷新
  });
}

/**
 * 开始备份
 */
export function useStartBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => getApi().tasks.create(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backupTasks"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
  });
}

export function normalizeOverviewData(
  data: WeArchiveHomeData | undefined,
): WeArchiveOverviewData {
  return {
    account: data?.account ?? null,
    stats: data?.stats ?? EMPTY_OVERVIEW_STATS,
    tasks: data?.tasks ?? [],
  };
}
