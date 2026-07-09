import type {
  WeArchiveOverviewAccount,
  WeArchiveOverviewStats,
  WeArchiveOverviewTask,
  WeArchiveViewId,
} from "@we-archive/core/types";
import type { LucideIcon } from "lucide-react";

export type WeArchiveRuntimePlatform =
  | "darwin"
  | "win32"
  | "linux"
  | "web"
  | "fnos";

export interface WeArchiveWindowControls {
  minimize?: () => void;
  toggleMaximize?: () => void;
  close?: () => void;
}

export interface WeArchiveShellProps {
  account?: WeArchiveOverviewAccount | null;
  stats: WeArchiveOverviewStats;
  tasks?: WeArchiveOverviewTask[];
  isLoading?: boolean;
  error?: string | null;
  activeView?: WeArchiveViewId;
  defaultActiveView?: WeArchiveViewId;
  platformLabel?: string;
  chrome?: "embedded" | "desktop";
  runtimePlatform?: WeArchiveRuntimePlatform;
  windowControls?: WeArchiveWindowControls;
  onActiveViewChange?: (viewId: WeArchiveViewId) => void;
  onBackupAction?: () => void | Promise<void>;
}

export type NavItem = {
  id: WeArchiveViewId;
  label: string;
  icon: LucideIcon;
  count?: number;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};
