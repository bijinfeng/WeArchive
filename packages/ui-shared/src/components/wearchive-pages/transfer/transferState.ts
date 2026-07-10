import type { BackupTask } from "@we-archive/core/types";

export type TransferMode = "import" | "export";
export type ImportStep = 0 | 1 | 2 | 3 | 4;
export type ExportStep = 0 | 1 | 2 | 3 | 4;
export type ImportCheckStatus = "idle" | "checking" | "paused" | "warning";
export type TransferQueueStatus =
  | "waiting"
  | "running"
  | "paused"
  | "completed"
  | "failed";

export interface ImportSourceOption {
  id: "local-backup" | "migration-package" | "legacy-db" | "iphone" | "android";
  title: string;
  description: string;
  actionLabel: string;
}

export interface ExportConversationOption {
  id: string;
  name: string;
  description: string;
  messageCount: number;
  attachmentCount: number;
}

export interface TransferQueueItem {
  id: string;
  type: "import" | "export";
  name: string;
  stage: string;
  progress: number;
  status: TransferQueueStatus;
  remainingTime: string;
}

export const IMPORT_STEPS = [
  "选择来源",
  "选择文件或目录",
  "检查文件",
  "确认保存方式",
  "开始导入",
] as const;

export const EXPORT_STEPS = [
  "选择导出范围",
  "选择导出格式",
  "设置导出内容",
  "选择保存位置",
  "开始导出",
] as const;

export const IMPORT_SOURCE_OPTIONS: ImportSourceOption[] = [
  {
    id: "local-backup",
    title: "本地备份文件",
    description: "适合导入之前导出的备份文件",
    actionLabel: "选择备份文件",
  },
  {
    id: "migration-package",
    title: "旧电脑迁移包",
    description: "适合从另一台电脑搬过来",
    actionLabel: "选择迁移包",
  },
  {
    id: "legacy-db",
    title: "历史数据库",
    description: "适合导入旧版本备份数据",
    actionLabel: "选择数据库",
  },
  {
    id: "iphone",
    title: "iPhone 备份",
    description: "适合从 Finder 或 iTunes 备份中读取",
    actionLabel: "选择备份目录",
  },
  {
    id: "android",
    title: "Android 本地目录",
    description: "适合从安卓手机导出的目录读取",
    actionLabel: "选择目录",
  },
];

export const EXPORT_CONVERSATIONS: ExportConversationOption[] = [
  {
    id: "customer-project",
    name: "客户项目群",
    description: "项目报价、交付节点和验收材料",
    messageCount: 5680,
    attachmentCount: 168,
  },
  {
    id: "customer-zhangmin",
    name: "客户张敏",
    description: "合同确认、发票和售后沟通",
    messageCount: 4216,
    attachmentCount: 123,
  },
  {
    id: "customer-after",
    name: "客户售后群",
    description: "售后问题跟踪和图片附件",
    messageCount: 2586,
    attachmentCount: 135,
  },
  {
    id: "family",
    name: "家庭群",
    description: "日常聊天和图片",
    messageCount: 912,
    attachmentCount: 42,
  },
];

export function getTaskQueueItems(tasks: BackupTask[]): TransferQueueItem[] {
  return tasks.map((task) => ({
    id: `task-${task.id}`,
    type: task.currentStep?.includes("导出") ? "export" : "import",
    name: task.title ?? `任务 #${task.id}`,
    stage: task.currentStep ?? "等待执行",
    progress: task.progress ?? 0,
    status: mapTaskStatus(task.status),
    remainingTime: task.remainingTime ?? "计算中",
  }));
}

function mapTaskStatus(status: BackupTask["status"]): TransferQueueStatus {
  if (status === "paused") {
    return "paused";
  }
  if (status === "completed") {
    return "completed";
  }
  if (status === "failed" || status === "partial") {
    return "failed";
  }
  if (status === "waiting" || status === "cancelled") {
    return "waiting";
  }
  return "running";
}
