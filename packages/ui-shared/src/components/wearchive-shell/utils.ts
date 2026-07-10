import type {
  WeArchiveOverviewAccount,
  WeArchiveViewId,
} from "@we-archive/core/types";
import { formatFileSize } from "@we-archive/core/utils";

const VIEW_SUBTITLES: Record<Exclude<WeArchiveViewId, "overview">, string> = {
  records: "按设计稿的三栏工作台浏览、搜索和批量处理聊天记录",
  backup: "查看备份队列、任务进度、日志和可继续操作",
  transfer: "导入旧备份、导出迁移包，并在执行前预览风险",
  restore: "检查恢复点并预览恢复策略，MVP 阶段禁用破坏性执行",
  settings: "管理存储、安全、导出默认值和运行时偏好",
};

export function getViewSubtitle(
  activeView: WeArchiveViewId,
  account: WeArchiveOverviewAccount | null,
  platformLabel: string,
) {
  if (activeView === "overview") {
    return account
      ? `${account.nickname ?? account.wxid ?? "微信账号"} 的备份状态`
      : `${platformLabel}已接入 WeArchive 服务`;
  }

  return VIEW_SUBTITLES[activeView];
}

export function formatStorage(value: number) {
  if (!value) {
    return "0 B";
  }

  return formatFileSize(value);
}
