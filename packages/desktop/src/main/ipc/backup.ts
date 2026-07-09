import type { TaskProgressEvent } from "@we-archive/core/services";
import type { BackupTask } from "@we-archive/core/types";
import { BrowserWindow, ipcMain } from "../electron";
import { services } from "../services";

/**
 * 注册备份任务相关的 IPC handlers
 */
export function registerBackupHandlers(): void {
  // 订阅任务进度事件，推送到渲染进程
  services.taskScheduler.on("progress", (event: TaskProgressEvent) => {
    const allWindows = BrowserWindow.getAllWindows();
    for (const window of allWindows) {
      window.webContents.send("task:progress", event);
    }
  });

  /**
   * 获取所有任务
   */
  ipcMain.handle("backup:getTasks", async (): Promise<BackupTask[]> => {
    try {
      return await services.taskScheduler.getAllTasks();
    } catch (error) {
      services.logService.error("Failed to get tasks", "IPC", error);
      throw error;
    }
  });

  /**
   * 创建备份任务
   */
  ipcMain.handle(
    "backup:start",
    async (
      _event,
      params: {
        name: string;
        accountId: number;
        savePath: string;
      },
    ): Promise<BackupTask> => {
      try {
        services.logService.info("Starting backup task", "IPC", params);

        const task = await services.taskScheduler.createTask({
          name: params.name,
          type: "backup",
          accountId: params.accountId,
          savePath: params.savePath,
        });

        return task;
      } catch (error) {
        services.logService.error("Failed to start backup", "IPC", error);
        throw error;
      }
    },
  );

  /**
   * 暂停任务
   */
  ipcMain.handle(
    "backup:pause",
    async (_event, taskId: number): Promise<void> => {
      try {
        await services.taskScheduler.pauseTask(taskId);
        services.logService.info("Task paused", "IPC", { taskId });
      } catch (error) {
        services.logService.error("Failed to pause task", "IPC", error);
        throw error;
      }
    },
  );

  /**
   * 继续任务
   */
  ipcMain.handle(
    "backup:resume",
    async (_event, taskId: number): Promise<void> => {
      try {
        await services.taskScheduler.resumeTask(taskId);
        services.logService.info("Task resumed", "IPC", { taskId });
      } catch (error) {
        services.logService.error("Failed to resume task", "IPC", error);
        throw error;
      }
    },
  );

  /**
   * 取消任务
   */
  ipcMain.handle(
    "backup:cancel",
    async (_event, taskId: number): Promise<void> => {
      try {
        await services.taskScheduler.cancelTask(taskId);
        services.logService.info("Task cancelled", "IPC", { taskId });
      } catch (error) {
        services.logService.error("Failed to cancel task", "IPC", error);
        throw error;
      }
    },
  );

  services.logService.info("Backup IPC handlers registered", "IPC");
}
