import type { MessageType } from "../types";
import type {
  NormalizedAccountInput,
  NormalizedArchiveInput,
  NormalizedAttachmentInput,
  NormalizedContactInput,
  NormalizedConversationInput,
  NormalizedMessageInput,
} from "./types";

const baseDate = new Date("2026-07-10T08:00:00.000Z");

const accounts: NormalizedAccountInput[] = [
  {
    stableId: "account-wxid_alice",
    wxid: "wxid_alice",
    nickname: "Alice",
    avatar: "avatar://alice",
    deviceSource: "pc",
    lastBackupAt: new Date("2026-07-10T09:12:00.000Z"),
    sourceId: "fixture-account-1",
    sourceHash: "fixture-account-hash-1",
    rawPayload: { source: "fixture", row: 1 },
  },
  {
    stableId: "account-wxid_ops",
    wxid: "wxid_ops",
    nickname: "运营工作号",
    avatar: "avatar://ops",
    deviceSource: "pc",
    lastBackupAt: new Date("2026-07-09T19:20:00.000Z"),
    sourceId: "fixture-account-2",
    sourceHash: "fixture-account-hash-2",
    rawPayload: { source: "fixture", row: 2 },
  },
];

const contacts: NormalizedContactInput[] = [
  ...accounts.map((account) => ({
    stableId: `contact-self-${account.wxid}`,
    accountWxid: account.wxid,
    wxid: account.wxid,
    nickname: account.nickname,
    avatar: account.avatar,
    type: "personal" as const,
    remark: "本人账号",
    sourceId: `fixture-contact-self-${account.wxid}`,
    sourceHash: `fixture-contact-self-hash-${account.wxid}`,
    rawPayload: { source: "fixture", self: true },
  })),
  ...Array.from({ length: 10 }, (_, index) => {
    const account = accounts[index % accounts.length];

    if (!account) {
      throw new Error("Fixture account is missing");
    }

    const contactIndex = index + 1;
    return {
      stableId: `contact-${contactIndex}`,
      accountWxid: account.wxid,
      wxid: `wxid_contact_${contactIndex}`,
      nickname: `联系人 ${contactIndex}`,
      avatar: `avatar://contact-${contactIndex}`,
      type: "personal" as const,
      remark: contactIndex % 3 === 0 ? "重点联系人" : undefined,
      sourceId: `fixture-contact-${contactIndex}`,
      sourceHash: `fixture-contact-hash-${contactIndex}`,
      rawPayload: { source: "fixture", row: contactIndex },
    };
  }),
].map((contact) => {
  const normalized: NormalizedContactInput = {
    stableId: contact.stableId,
    accountWxid: contact.accountWxid,
    wxid: contact.wxid,
    nickname: contact.nickname,
    type: contact.type,
    sourceId: contact.sourceId,
    sourceHash: contact.sourceHash,
    rawPayload: contact.rawPayload,
  };

  if (contact.avatar) {
    normalized.avatar = contact.avatar;
  }

  if (contact.remark) {
    normalized.remark = contact.remark;
  }

  return normalized;
});

const conversations: NormalizedConversationInput[] = Array.from(
  { length: 10 },
  (_, index) => {
    const account = accounts[index % accounts.length];

    if (!account) {
      throw new Error("Fixture account is missing");
    }

    const conversationIndex = index + 1;
    const isGroup = conversationIndex % 3 === 0;
    return {
      stableId: `conversation-${conversationIndex}`,
      accountWxid: account.wxid,
      conversationId: `fixture-conversation-${conversationIndex}`,
      type: isGroup ? "group" : "personal",
      name: isGroup
        ? `项目群 ${conversationIndex}`
        : `聊天 ${conversationIndex}`,
      avatar: `avatar://conversation-${conversationIndex}`,
      memberCount: isGroup ? 8 + conversationIndex : 1,
      messageCount: 6,
      lastMessageAt: new Date(baseDate.getTime() + index * 60 * 60 * 1000),
      backupStatus: conversationIndex === 4 ? "partial" : "complete",
      isFavorite: conversationIndex === 1 || conversationIndex === 6,
      sourceId: `fixture-conversation-${conversationIndex}`,
      sourceHash: `fixture-conversation-hash-${conversationIndex}`,
      rawPayload: { source: "fixture", row: conversationIndex },
    };
  },
);

const messageTypes = [
  "text",
  "image",
  "voice",
  "file",
  "link",
  "miniprogram",
  "transfer",
  "system",
  "location",
  "contact-card",
  "group-notice",
  "merged",
  "red-packet",
] satisfies MessageType[];

const messages: NormalizedMessageInput[] = conversations.flatMap(
  (conversation, conversationIndex) =>
    Array.from({ length: 6 }, (_, messageIndex) => {
      const sequence = conversationIndex * 6 + messageIndex + 1;
      const type: MessageType =
        sequence === 17
          ? "unknown"
          : (messageTypes[sequence % messageTypes.length] ?? "text");
      const senderIndex = (sequence % 10) + 1;

      return {
        stableId: `message-${sequence}`,
        conversationStableId: conversation.stableId,
        messageId: `fixture-message-${sequence}`,
        senderWxid:
          messageIndex % 2 === 0
            ? conversation.accountWxid
            : `wxid_contact_${senderIndex}`,
        senderName: messageIndex % 2 === 0 ? "我" : `联系人 ${senderIndex}`,
        type,
        content:
          type === "unknown"
            ? "[未知消息] 原始类型 10000"
            : `第 ${sequence} 条 ${conversation.name} ${type} 消息`,
        timestamp: new Date(
          baseDate.getTime() + (sequence - 1) * 10 * 60 * 1000,
        ),
        hasAttachment: sequence <= 8,
        sourceId: `fixture-message-${sequence}`,
        sourceHash: `fixture-message-hash-${sequence}`,
        rawPayload: { source: "fixture", row: sequence, type },
      };
    }),
);

const attachments: NormalizedAttachmentInput[] = Array.from(
  { length: 8 },
  (_, index) => {
    const message = messages[index];

    if (!message) {
      throw new Error("Fixture message is missing");
    }

    const attachmentIndex = index + 1;
    const type = attachmentIndex % 4 === 0 ? "file" : "image";

    return {
      stableId: `attachment-${attachmentIndex}`,
      messageStableId: message.stableId,
      type,
      filename: `wearchive-attachment-${attachmentIndex}.${type === "file" ? "zip" : "png"}`,
      fileSize: attachmentIndex * 1024,
      filePath: `/fixture/attachments/${attachmentIndex}`,
      checksum: `fixture-attachment-hash-${attachmentIndex}`,
      backupStatus: attachmentIndex === 5 ? "partial" : "complete",
      sourceId: `fixture-attachment-${attachmentIndex}`,
      sourceHash: `fixture-attachment-hash-${attachmentIndex}`,
      rawPayload: { source: "fixture", row: attachmentIndex },
    };
  },
);

export const weArchiveFixture: NormalizedArchiveInput = {
  metadata: {
    archiveId: "fixture-archive-v0",
    name: "WeArchive MVP Fixture",
    sourceType: "fixture",
    sourceVersion: "0.0.1",
    sourcePath: "/fixture/wearchive",
    createdAt: baseDate,
  },
  accounts,
  contacts,
  conversations,
  messages,
  attachments,
  taskLogs: [
    {
      level: "info",
      message: "开始导入 WeArchive MVP fixture",
      createdAt: new Date("2026-07-10T08:00:00.000Z"),
      metadata: { step: "start" },
    },
    {
      level: "warn",
      message: "发现 1 个附件未完整备份",
      createdAt: new Date("2026-07-10T08:02:00.000Z"),
      metadata: { attachmentStableId: "attachment-5" },
    },
    {
      level: "info",
      message: "导入完成",
      createdAt: new Date("2026-07-10T08:05:00.000Z"),
      metadata: { step: "completed" },
    },
  ],
  warnings: [
    {
      code: "ATTACHMENT_PARTIAL",
      message: "附件 attachment-5 未完整备份，已保留占位信息。",
      stableId: "attachment-5",
    },
  ],
};
