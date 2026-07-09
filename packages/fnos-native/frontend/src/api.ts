import type {
  WeArchiveOverviewAccount,
  WeArchiveOverviewData,
  WeArchiveOverviewTask,
  WeArchiveStatsInput,
} from "@we-archive/core/types";
import { normalizeOverviewStats } from "@we-archive/core/utils";

export async function loadOverview(
  signal?: AbortSignal,
): Promise<WeArchiveOverviewData> {
  const requestInit = signal ? { signal } : undefined;

  const [accounts, stats, tasks] = await Promise.all([
    request<WeArchiveOverviewAccount[]>("api/accounts", requestInit),
    request<WeArchiveStatsInput>("api/stats", {
      ...requestInit,
    }),
    request<WeArchiveOverviewTask[]>("api/backup/tasks", requestInit),
  ]);

  return {
    account: accounts[0] ?? null,
    stats: normalizeOverviewStats(stats),
    tasks,
  };
}

export async function startBackup() {
  return request<WeArchiveOverviewTask>("api/backup/start", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

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

function getBasePath() {
  return import.meta.env.BASE_URL || "/";
}
