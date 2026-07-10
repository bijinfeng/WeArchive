import type {
  BackupStatus,
  Conversation,
  ConversationDetail,
  ConversationType,
  Message,
  MessageType,
  WeArchiveViewId,
} from "@we-archive/core/types";

export interface RecordsNavigationIntent {
  source: "records-batch" | "records-detail";
  mode?: "export";
  conversationIds?: string[];
}

export interface RecordsPageProps {
  conversations: Conversation[];
  detailsByConversationId: Record<string, ConversationDetail>;
  messagesByConversationId: Record<string, Message[]>;
  query?: string | undefined;
  selectedConversationId?: string | undefined;
  isLoading?: boolean;
  onSelectedConversationChange?: ((conversationId: string) => void) | undefined;
  onNavigate?:
    | ((viewId: WeArchiveViewId, intent?: RecordsNavigationIntent) => void)
    | undefined;
}

export interface RecordsFilters {
  type: ConversationType | "all";
  backupStatus: BackupStatus | "all";
  hasAttachments: boolean;
  favoritesOnly: boolean;
}

export const DEFAULT_RECORDS_FILTERS: RecordsFilters = {
  type: "all",
  backupStatus: "all",
  hasAttachments: false,
  favoritesOnly: false,
};

export const MESSAGE_TYPE_LABELS: Record<MessageType, string> = {
  text: "文本",
  image: "图片",
  video: "视频",
  voice: "语音",
  file: "文件",
  link: "链接",
  miniprogram: "小程序",
  transfer: "转账",
  system: "系统",
  location: "位置",
  "contact-card": "名片",
  "group-notice": "群公告",
  merged: "合并记录",
  unknown: "未知",
  "red-packet": "红包",
};

export function filterConversations(
  conversations: Conversation[],
  query: string,
  filters: RecordsFilters,
) {
  const normalizedQuery = query.trim().toLowerCase();

  return conversations.filter((conversation) => {
    if (filters.type !== "all" && conversation.type !== filters.type) {
      return false;
    }

    if (
      filters.backupStatus !== "all" &&
      conversation.backupStatus !== filters.backupStatus
    ) {
      return false;
    }

    if (filters.hasAttachments && !conversation.hasAttachments) {
      return false;
    }

    if (filters.favoritesOnly && !conversation.isFavorite) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return [
      conversation.name,
      conversation.conversationId,
      conversation.lastMessagePreview,
      conversation.type,
      conversation.backupStatus,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });
}

export function getConversationTypeLabel(type: ConversationType) {
  if (type === "group") {
    return "群聊";
  }

  if (type === "official") {
    return "公众号";
  }

  if (type === "enterprise") {
    return "企业微信";
  }

  return "个人";
}

export function getBackupStatusLabel(status: BackupStatus) {
  if (status === "partial") {
    return "部分完成";
  }

  if (status === "none") {
    return "未备份";
  }

  return "正常";
}

export function getBackupStatusTone(status: BackupStatus) {
  if (status === "partial") {
    return "orange" as const;
  }

  if (status === "none") {
    return "red" as const;
  }

  return "green" as const;
}
