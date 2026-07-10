import { getSqlite } from "@we-archive/core/database";
import {
  cancelTask,
  createTask,
  getTaskDetail,
  listTasks,
  pauseTask,
  resumeTask,
  retryTask,
  startTask,
} from "@we-archive/core/repositories";
import type { TaskProgressEvent } from "@we-archive/core/services";
import type { CreateTaskInput } from "@we-archive/core/types";
import { BrowserWindow, ipcMain } from "electron";
import { services } from "../services";

/**
 * 注册任务相关的 IPC handlers
 */
export function registerBackupHandlers(): void {
  // 兼容未来长任务调度器的进度推送。
  services.taskScheduler.on("progress", (event: TaskProgressEvent) => {
    const allWindows = BrowserWindow.getAllWindows();
    for (const window of allWindows) {
      window.webContents.send("task:progress", event);
    }
  });

  ipcMain.handle("tasks:list", async () => listTasks());

  ipcMain.handle(
    "tasks:create",
    async (_event, input: Partial<CreateTaskInput> = {}) =>
      createTask({
        accountId: input.accountId ?? resolveDefaultAccountId(),
        savePath: input.savePath ?? "",
        currentStep: input.currentStep ?? "等待备份",
      }),
  );

  ipcMain.handle("tasks:pause", async (_event, taskId: number) =>
    pauseTask(taskId),
  );

  ipcMain.handle("tasks:start", async (_event, taskId: number) =>
    startTask(taskId),
  );

  ipcMain.handle("tasks:resume", async (_event, taskId: number) =>
    resumeTask(taskId),
  );

  ipcMain.handle("tasks:cancel", async (_event, taskId: number) =>
    cancelTask(taskId),
  );

  ipcMain.handle("tasks:retry", async (_event, taskId: number) =>
    retryTask(taskId),
  );

  ipcMain.handle("tasks:getDetail", async (_event, taskId: number) =>
    getTaskDetail(taskId),
  );

  services.logService.info("Task IPC handlers registered", "IPC");
}

function resolveDefaultAccountId(): number {
  const row = getSqlite()
    .prepare("SELECT id FROM accounts ORDER BY last_backup_at DESC LIMIT 1")
    .get() as { id: number } | undefined;

  if (!row) {
    throw new Error("No account is available for task creation");
  }

  return row.id;
}
