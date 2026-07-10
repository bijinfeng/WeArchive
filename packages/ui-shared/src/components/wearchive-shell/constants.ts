import type { WeArchiveViewId } from "@we-archive/core/types";
import {
  ArrowDownUp,
  FolderArchive,
  Home,
  MessageCircle,
  RotateCcw,
  Settings,
} from "lucide-react";

import type { NavSection } from "./types";

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "概览",
    items: [{ id: "overview", label: "首页", icon: Home }],
  },
  {
    title: "数据管理",
    items: [
      { id: "records", label: "聊天记录", icon: MessageCircle },
      { id: "transfer", label: "导入导出", icon: ArrowDownUp },
    ],
  },
  {
    title: "备份",
    items: [
      { id: "backup", label: "备份任务", icon: FolderArchive },
      { id: "restore", label: "恢复管理", icon: RotateCcw },
    ],
  },
  {
    title: "系统",
    items: [{ id: "settings", label: "设置", icon: Settings }],
  },
];

export const VIEW_TITLES: Record<WeArchiveViewId, string> = {
  overview: "数据概览",
  records: "聊天记录",
  backup: "备份任务",
  transfer: "导入导出",
  restore: "恢复管理",
  settings: "设置",
};

export const VIEW_PLACEHOLDERS: Record<WeArchiveViewId, string> = {
  overview: "搜索账号、任务或异常",
  records: "搜索联系人、群聊、消息或文件",
  backup: "搜索任务、账号或保存位置",
  transfer: "搜索导入文件、导出任务",
  restore: "搜索恢复点、目标账号或风险项",
  settings: "搜索设置项",
};
