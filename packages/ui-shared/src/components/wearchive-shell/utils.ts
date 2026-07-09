import type {
  WeArchiveOverviewAccount,
  WeArchiveViewId,
} from "@we-archive/core/types";
import { formatFileSize } from "@we-archive/core/utils";

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

  return "当前先接入整体布局，后续页面内容会按模块继续补齐";
}

export function formatStorage(value: number) {
  if (!value) {
    return "0 B";
  }

  return formatFileSize(value);
}
