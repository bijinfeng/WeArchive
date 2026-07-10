import type { BackupTask, TaskStatus } from "@we-archive/core/types";

export type TaskTone = "blue" | "green" | "orange" | "red" | "gray";

export type TaskProgressVariant =
  | "accent"
  | "success"
  | "warning"
  | "neutral"
  | "error";

export type TaskActionId =
  | "start"
  | "pause"
  | "resume"
  | "cancel"
  | "retry"
  | "open-location"
  | "view-report"
  | "view-detail"
  | "view-issues"
  | "view-log"
  | "delete-record";

export interface TaskStatusMeta {
  label: string;
  description: string;
  tone: TaskTone;
  progressVariant: TaskProgressVariant;
}

export interface TaskAction {
  id: TaskActionId;
  label: string;
  variant: "primary" | "secondary" | "ghost";
}

export interface TaskSummaryCounts {
  inProgress: number;
  waiting: number;
  paused: number;
  needsAttention: number;
}

const TASK_STATUS_META: Record<TaskStatus, TaskStatusMeta> = {
  waiting: {
    label: "等待开始",
    description: "任务已进入队列，尚未开始处理。",
    tone: "orange",
    progressVariant: "warning",
  },
  scanning: {
    label: "正在查找聊天记录",
    description: "正在扫描微信数据和可用附件。",
    tone: "blue",
    progressVariant: "accent",
  },
  "backing-up": {
    label: "正在备份聊天记录",
    description: "正在保存消息、附件和索引。",
    tone: "blue",
    progressVariant: "accent",
  },
  verifying: {
    label: "正在检查备份是否完整",
    description: "正在校验消息数量、附件和索引。",
    tone: "blue",
    progressVariant: "accent",
  },
  paused: {
    label: "已暂停，已完成部分会保留",
    description: "任务已暂停，可从当前位置继续。",
    tone: "orange",
    progressVariant: "warning",
  },
  completed: {
    label: "备份完成",
    description: "任务已完成，可打开位置或查看报告。",
    tone: "green",
    progressVariant: "success",
  },
  partial: {
    label: "部分备份完成",
    description: "可查看问题并重试失败项。",
    tone: "orange",
    progressVariant: "warning",
  },
  failed: {
    label: "备份失败",
    description: "任务未完成，需要查看日志或重试。",
    tone: "red",
    progressVariant: "error",
  },
  cancelled: {
    label: "已取消",
    description: "任务已取消，已完成部分会保留。",
    tone: "gray",
    progressVariant: "neutral",
  },
};

export function getTaskStatusMeta(status: TaskStatus) {
  return TASK_STATUS_META[status];
}

export function getTaskActions(task: BackupTask): TaskAction[] {
  switch (task.status) {
    case "waiting":
      return [
        { id: "start", label: "提前开始", variant: "primary" },
        { id: "cancel", label: "取消", variant: "secondary" },
      ];
    case "scanning":
    case "backing-up":
      return [
        { id: "pause", label: "暂停", variant: "secondary" },
        { id: "view-detail", label: "查看详情", variant: "secondary" },
      ];
    case "verifying":
      return [{ id: "view-detail", label: "查看详情", variant: "secondary" }];
    case "paused":
      return [
        { id: "resume", label: "继续", variant: "primary" },
        { id: "cancel", label: "取消", variant: "secondary" },
      ];
    case "completed":
      return [
        { id: "open-location", label: "打开位置", variant: "secondary" },
        { id: "view-report", label: "查看报告", variant: "secondary" },
      ];
    case "partial":
      return [
        { id: "view-issues", label: "查看问题", variant: "secondary" },
        { id: "retry", label: "重试失败项", variant: "primary" },
      ];
    case "failed":
      return [
        { id: "retry", label: "重试", variant: "primary" },
        { id: "view-log", label: "查看日志", variant: "secondary" },
      ];
    case "cancelled":
      return [{ id: "delete-record", label: "删除记录", variant: "ghost" }];
  }
}

export function summarizeTasks(tasks: BackupTask[]): TaskSummaryCounts {
  return {
    inProgress: tasks.filter((task) =>
      ["scanning", "backing-up", "verifying"].includes(task.status),
    ).length,
    waiting: tasks.filter((task) => task.status === "waiting").length,
    paused: tasks.filter((task) => task.status === "paused").length,
    needsAttention: tasks.filter((task) =>
      ["failed", "partial"].includes(task.status),
    ).length,
  };
}
