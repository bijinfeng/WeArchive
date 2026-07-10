import type { NormalizedArchiveInput } from "@we-archive/core/archive";
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
import type { ApiAdapter } from "@we-archive/ui-shared/hooks";

export const fnosAdapter: ApiAdapter = {
  overview: {
    getData: () => request("api/overview"),
    seedFixture: () => post("api/dev/seed-fixture", {}),
  },
  conversations: {
    list: (params) => request(`api/conversations?${toQuery(params)}`),
    getDetail: (conversationId) =>
      request(
        `api/conversations/${encodeURIComponent(String(conversationId))}`,
      ),
  },
  messages: {
    list: (params) => request(`api/messages?${toQuery(params)}`),
  },
  tasks: {
    list: () => request("api/tasks"),
    create: (input) => post("api/tasks", input ?? {}),
    start: (taskId) => post(`api/tasks/${taskId}/start`, {}),
    pause: (taskId) => post(`api/tasks/${taskId}/pause`, {}),
    resume: (taskId) => post(`api/tasks/${taskId}/resume`, {}),
    cancel: (taskId) => post(`api/tasks/${taskId}/cancel`, {}),
    retry: (taskId) => post(`api/tasks/${taskId}/retry`, {}),
    getDetail: (taskId) => request(`api/tasks/${taskId}`),
    listLogs: (params) => request(`api/task-logs?${toQuery(params ?? {})}`),
  },
  transfer: {
    planImport: (input) => post("api/transfer/import/plan", input),
    planExport: (input) => post("api/transfer/export/plan", input),
    executeImport: (input) => post("api/transfer/import/execute", input ?? {}),
    executeExport: (input) => post("api/transfer/export/execute", input),
  },
  settings: {
    get: (key) => request(`api/settings?${toQuery({ key })}`),
    set: (key, value) => post("api/settings", { key, value }),
  },
  restore: {
    listPoints: () => request("api/restore/points"),
    checkPoint: (restorePointId) =>
      request(`api/restore/points/${restorePointId}`),
    previewStrategy: (input) => post("api/restore/preview", input),
    execute: (input) => post("api/restore/execute", input),
  },
  file: {
    selectFile: async () => null,
    selectDirectory: async () => null,
    isReadable: async () => true,
    isWritable: async () => true,
    getSize: async () => 0,
    getDirectorySize: async () => 0,
    getAvailableSpace: async () => 0,
  },
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getBasePath()}${path.replace(/^\/+/, "")}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

function post<T>(
  path: string,
  body:
    | Partial<CreateTaskInput>
    | ExecuteExportInput
    | ExecuteImportInput
    | ExportDraftInput
    | NormalizedArchiveInput
    | RestoreStrategyInput
    | Record<string, unknown>,
): Promise<T> {
  return request(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function toQuery(
  params:
    | ConversationListParams
    | MessageListParams
    | TaskLogListParams
    | Record<string, unknown>,
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  }

  return searchParams.toString();
}

function getBasePath() {
  return import.meta.env.BASE_URL || "/";
}
