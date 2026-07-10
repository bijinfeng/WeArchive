import { getSqlite } from "../database";
import type {
  BackupTask,
  CreateTaskInput,
  TaskDetail,
  TaskLog,
  TaskLogListParams,
  TaskStatus,
} from "../types";

interface TaskRow {
  id: number;
  accountId: number;
  accountName: string | null;
  status: TaskStatus;
  progress: number | null;
  currentStep: string | null;
  startedAt: number;
  completedAt: number | null;
  elapsedTime: number | null;
  savePath: string;
  errorCount: number | null;
  warningCount: number | null;
}

interface TaskLogRow {
  id: number;
  taskId: number | null;
  importJobId: number | null;
  exportJobId: number | null;
  level: TaskLog["level"];
  message: string;
  metadataJson: string | null;
  createdAt: number;
}

function mapTask(row: TaskRow): BackupTask {
  const accountName = row.accountName ?? `账号 #${row.accountId}`;

  return {
    id: row.id,
    accountId: row.accountId,
    title: getTaskTitle(row, accountName),
    accountName,
    scope: "全部会话",
    status: row.status,
    progress: row.progress,
    currentStep: row.currentStep,
    startedAt: new Date(row.startedAt),
    completedAt: row.completedAt == null ? null : new Date(row.completedAt),
    elapsedTime: row.elapsedTime,
    savePath: row.savePath,
    errorCount: row.errorCount,
    warningCount: row.warningCount,
  };
}

function mapTaskLog(row: TaskLogRow): TaskLog {
  return {
    id: row.id,
    taskId: row.taskId,
    importJobId: row.importJobId,
    exportJobId: row.exportJobId,
    level: row.level,
    message: row.message,
    metadata: row.metadataJson
      ? (JSON.parse(row.metadataJson) as Record<string, unknown>)
      : null,
    createdAt: new Date(row.createdAt),
  };
}

function validActions(status: TaskStatus): TaskDetail["validActions"] {
  switch (status) {
    case "waiting":
      return ["start", "cancel"];
    case "scanning":
    case "backing-up":
      return ["pause", "cancel"];
    case "paused":
      return ["resume", "cancel"];
    case "failed":
    case "partial":
      return ["retry"];
    case "verifying":
    case "cancelled":
    case "completed":
      return [];
  }
}

export async function createTask(input: CreateTaskInput): Promise<BackupTask> {
  const sqlite = getSqlite();
  const now = Date.now();
  const result = sqlite
    .prepare(
      `
      INSERT INTO backup_tasks (
        account_id, status, progress, current_step, started_at, elapsed_time,
        save_path, error_count, warning_count
      )
      VALUES (?, 'waiting', 0, ?, ?, 0, ?, 0, 0)
    `,
    )
    .run(input.accountId, input.currentStep ?? "等待开始", now, input.savePath);

  return getTask(Number(result.lastInsertRowid));
}

export async function createFailedTask(
  input: CreateTaskInput & {
    progress?: number;
    errorCount?: number;
    warningCount?: number;
  },
): Promise<BackupTask> {
  const sqlite = getSqlite();
  const now = Date.now();
  const result = sqlite
    .prepare(
      `
      INSERT INTO backup_tasks (
        account_id, status, progress, current_step, started_at, elapsed_time,
        save_path, error_count, warning_count
      )
      VALUES (?, 'failed', ?, ?, ?, 0, ?, ?, ?)
    `,
    )
    .run(
      input.accountId,
      input.progress ?? 34,
      input.currentStep ?? "连接中断",
      now,
      input.savePath,
      input.errorCount ?? 1,
      input.warningCount ?? 0,
    );

  return getTask(Number(result.lastInsertRowid));
}

export async function listTasks(limit = 50): Promise<BackupTask[]> {
  const rows = getSqlite()
    .prepare(
      `
      SELECT
        task.id,
        task.account_id AS accountId,
        account.nickname AS accountName,
        task.status,
        task.progress,
        task.current_step AS currentStep,
        task.started_at AS startedAt,
        task.completed_at AS completedAt,
        task.elapsed_time AS elapsedTime,
        task.save_path AS savePath,
        task.error_count AS errorCount,
        task.warning_count AS warningCount
      FROM backup_tasks task
      LEFT JOIN accounts account ON account.id = task.account_id
      ORDER BY task.started_at DESC, task.id DESC
      LIMIT ?
    `,
    )
    .all(limit) as TaskRow[];

  return rows.map(mapTask);
}

export async function getTask(taskId: number): Promise<BackupTask> {
  const row = getSqlite()
    .prepare(
      `
      SELECT
        task.id,
        task.account_id AS accountId,
        account.nickname AS accountName,
        task.status,
        task.progress,
        task.current_step AS currentStep,
        task.started_at AS startedAt,
        task.completed_at AS completedAt,
        task.elapsed_time AS elapsedTime,
        task.save_path AS savePath,
        task.error_count AS errorCount,
        task.warning_count AS warningCount
      FROM backup_tasks task
      LEFT JOIN accounts account ON account.id = task.account_id
      WHERE task.id = ?
      LIMIT 1
    `,
    )
    .get(taskId) as TaskRow | undefined;

  if (!row) {
    throw new Error(`Task ${taskId} was not found`);
  }

  return mapTask(row);
}

export async function getTaskDetail(taskId: number): Promise<TaskDetail> {
  const task = await getTask(taskId);

  return {
    task,
    logs: await listTaskLogs({ taskId }),
    validActions: validActions(task.status),
  };
}

async function updateTaskStatus(
  taskId: number,
  status: TaskStatus,
  currentStep: string,
  options: { completedAt?: number | null; reset?: boolean } = {},
): Promise<BackupTask> {
  getSqlite()
    .prepare(
      `
      UPDATE backup_tasks
      SET status = ?,
        current_step = ?,
        completed_at = ?,
        progress = CASE WHEN ? THEN 0 ELSE progress END,
        error_count = CASE WHEN ? THEN 0 ELSE error_count END,
        warning_count = CASE WHEN ? THEN 0 ELSE warning_count END
      WHERE id = ?
    `,
    )
    .run(
      status,
      currentStep,
      options.completedAt ?? null,
      options.reset ? 1 : 0,
      options.reset ? 1 : 0,
      options.reset ? 1 : 0,
      taskId,
    );

  return getTask(taskId);
}

export function pauseTask(taskId: number): Promise<BackupTask> {
  return updateTaskStatus(taskId, "paused", "已暂停，已完成部分会保留");
}

export function startTask(taskId: number): Promise<BackupTask> {
  return updateTaskStatus(taskId, "scanning", "正在查找聊天记录");
}

export function resumeTask(taskId: number): Promise<BackupTask> {
  return updateTaskStatus(taskId, "backing-up", "正在备份聊天记录");
}

export function cancelTask(taskId: number): Promise<BackupTask> {
  return updateTaskStatus(taskId, "cancelled", "已取消", {
    completedAt: Date.now(),
  });
}

export function retryTask(taskId: number): Promise<BackupTask> {
  return updateTaskStatus(taskId, "waiting", "等待重试", {
    completedAt: null,
    reset: true,
  });
}

function getTaskTitle(row: TaskRow, accountName: string): string {
  const step = row.currentStep ?? "";

  if (step.includes("导入")) {
    return `${accountName} 导入任务`;
  }

  if (step.includes("导出")) {
    return `${accountName} 导出任务`;
  }

  if (step.includes("恢复")) {
    return `${accountName} 恢复任务`;
  }

  return `${accountName} 备份任务`;
}

export async function listTaskLogs(
  params: TaskLogListParams = {},
): Promise<TaskLog[]> {
  const conditions: string[] = [];
  const args: unknown[] = [];

  if (params.taskId !== undefined) {
    conditions.push("task_id = ?");
    args.push(params.taskId);
  }
  if (params.importJobId !== undefined) {
    conditions.push("import_job_id = ?");
    args.push(params.importJobId);
  }
  if (params.exportJobId !== undefined) {
    conditions.push("export_job_id = ?");
    args.push(params.exportJobId);
  }
  if (params.level && params.level !== "all") {
    conditions.push("level = ?");
    args.push(params.level);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = getSqlite()
    .prepare(
      `
      SELECT
        id,
        task_id AS taskId,
        import_job_id AS importJobId,
        export_job_id AS exportJobId,
        level,
        message,
        metadata_json AS metadataJson,
        created_at AS createdAt
      FROM task_logs
      ${whereClause}
      ORDER BY created_at ASC, id ASC
    `,
    )
    .all(...args) as TaskLogRow[];

  return rows.map(mapTaskLog);
}
