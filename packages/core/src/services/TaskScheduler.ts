import { EventEmitter } from "node:events";
import { eq } from "drizzle-orm";
import { getDatabase, schema } from "../database";
import type { BackupTask, TaskStatus } from "../types";

/**
 * 任务进度事件
 */
export interface TaskProgressEvent {
  taskId: string;
  status: TaskStatus;
  progress: number;
  currentStep: string;
  processedCount: number;
  totalCount?: number;
  speed?: number;
  remainingTime?: number;
  errors: number;
  warnings: number;
}

/**
 * 任务调度器
 */
export class TaskScheduler extends EventEmitter {
  private runningTasks = new Map<string, AbortController>();
  private maxConcurrent = 3; // 最多同时运行3个任务

  /**
   * 创建任务
   */
  async createTask(params: {
    name: string;
    type: "backup" | "import" | "export" | "restore";
    accountId: number;
    dataRange?: string;
    savePath: string;
  }): Promise<BackupTask> {
    const db = getDatabase();

    const now = new Date();

    const [task] = await db
      .insert(schema.backupTasks)
      .values({
        accountId: params.accountId,
        status: "waiting",
        progress: 0,
        currentStep: "等待开始",
        startedAt: now,
        savePath: params.savePath,
        errorCount: 0,
        warningCount: 0,
      })
      .returning();

    // 尝试启动任务
    this.tryStartNextTask();

    return task as BackupTask;
  }

  /**
   * 启动任务
   */
  async startTask(taskId: number): Promise<void> {
    const db = getDatabase();

    // 检查是否超过并发限制
    if (this.runningTasks.size >= this.maxConcurrent) {
      throw new Error("Maximum concurrent tasks reached");
    }

    // 更新任务状态
    await db
      .update(schema.backupTasks)
      .set({
        status: "backing-up",
        startedAt: new Date(),
      })
      .where(eq(schema.backupTasks.id, taskId));

    // 创建 AbortController
    const controller = new AbortController();
    this.runningTasks.set(String(taskId), controller);

    // 发送状态变化事件
    this.emitProgress(taskId, {
      status: "backing-up",
      progress: 0,
      currentStep: "准备中",
      processedCount: 0,
      errors: 0,
      warnings: 0,
    });
  }

  /**
   * 暂停任务
   */
  async pauseTask(taskId: number): Promise<void> {
    const db = getDatabase();
    const controller = this.runningTasks.get(String(taskId));

    if (!controller) {
      throw new Error("Task is not running");
    }

    // 中止任务
    controller.abort();
    this.runningTasks.delete(String(taskId));

    // 更新状态
    await db
      .update(schema.backupTasks)
      .set({
        status: "paused",
      })
      .where(eq(schema.backupTasks.id, taskId));

    this.emitProgress(taskId, {
      status: "paused",
      currentStep: "已暂停",
    });

    // 尝试启动下一个等待的任务
    this.tryStartNextTask();
  }

  /**
   * 继续任务
   */
  async resumeTask(taskId: number): Promise<void> {
    const db = getDatabase();

    await db
      .update(schema.backupTasks)
      .set({
        status: "waiting",
      })
      .where(eq(schema.backupTasks.id, taskId));

    this.tryStartNextTask();
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: number): Promise<void> {
    const db = getDatabase();
    const controller = this.runningTasks.get(String(taskId));

    if (controller) {
      controller.abort();
      this.runningTasks.delete(String(taskId));
    }

    await db
      .update(schema.backupTasks)
      .set({
        status: "cancelled",
        completedAt: new Date(),
      })
      .where(eq(schema.backupTasks.id, taskId));

    this.emitProgress(taskId, {
      status: "cancelled",
      currentStep: "已取消",
    });

    this.tryStartNextTask();
  }

  /**
   * 更新任务进度
   */
  async updateProgress(
    taskId: number,
    update: Partial<{
      progress: number;
      currentStep: string;
      processedCount: number;
      totalCount: number;
      errors: number;
      warnings: number;
    }>,
  ): Promise<void> {
    const db = getDatabase();

    await db
      .update(schema.backupTasks)
      .set({
        progress: update.progress,
        currentStep: update.currentStep,
        errorCount: update.errors,
        warningCount: update.warnings,
      })
      .where(eq(schema.backupTasks.id, taskId));

    this.emitProgress(taskId, update);
  }

  /**
   * 完成任务
   */
  async completeTask(
    taskId: number,
    result: {
      status: "completed" | "partial" | "failed";
      message?: string;
      errors?: number;
      warnings?: number;
    },
  ): Promise<void> {
    const db = getDatabase();
    const controller = this.runningTasks.get(String(taskId));

    if (controller) {
      this.runningTasks.delete(String(taskId));
    }

    await db
      .update(schema.backupTasks)
      .set({
        status: result.status,
        progress: result.status === "completed" ? 100 : undefined,
        errorCount: result.errors,
        warningCount: result.warnings,
        completedAt: new Date(),
      })
      .where(eq(schema.backupTasks.id, taskId));

    this.emitProgress(taskId, {
      status: result.status,
      currentStep: result.message || "已完成",
    });

    this.tryStartNextTask();
  }

  /**
   * 获取任务状态
   */
  async getTask(taskId: number): Promise<BackupTask | null> {
    const db = getDatabase();
    const [task] = await db
      .select()
      .from(schema.backupTasks)
      .where(eq(schema.backupTasks.id, taskId))
      .limit(1);

    return (task as BackupTask) || null;
  }

  /**
   * 获取所有任务
   */
  async getAllTasks(limit = 50): Promise<BackupTask[]> {
    const db = getDatabase();
    const tasks = await db
      .select()
      .from(schema.backupTasks)
      .orderBy(schema.backupTasks.startedAt)
      .limit(limit);

    return tasks as BackupTask[];
  }

  /**
   * 尝试启动下一个等待的任务
   */
  private async tryStartNextTask(): Promise<void> {
    if (this.runningTasks.size >= this.maxConcurrent) {
      return;
    }

    const db = getDatabase();
    const [nextTask] = await db
      .select()
      .from(schema.backupTasks)
      .where(eq(schema.backupTasks.status, "waiting"))
      .orderBy(schema.backupTasks.startedAt)
      .limit(1);

    if (nextTask) {
      await this.startTask(nextTask.id);
    }
  }

  /**
   * 发送进度事件
   */
  private emitProgress(
    taskId: number,
    partial: Partial<TaskProgressEvent>,
  ): void {
    const event: TaskProgressEvent = {
      taskId: String(taskId),
      status: partial.status || "backing-up",
      progress: partial.progress ?? 0,
      currentStep: partial.currentStep || "",
      processedCount: partial.processedCount ?? 0,
      errors: partial.errors ?? 0,
      warnings: partial.warnings ?? 0,
    };

    if (partial.totalCount !== undefined) {
      event.totalCount = partial.totalCount;
    }
    if (partial.speed !== undefined) {
      event.speed = partial.speed;
    }
    if (partial.remainingTime !== undefined) {
      event.remainingTime = partial.remainingTime;
    }

    this.emit("progress", event);
  }

  /**
   * 检查任务是否被中止
   */
  isTaskAborted(taskId: number): boolean {
    const controller = this.runningTasks.get(String(taskId));
    return controller?.signal.aborted ?? false;
  }
}
