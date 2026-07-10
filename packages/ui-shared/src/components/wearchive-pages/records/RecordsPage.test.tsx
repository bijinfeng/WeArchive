// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import type {
  Conversation,
  ConversationDetail,
  Message,
} from "@we-archive/core/types";
import { describe, expect, it, vi } from "vitest";

import { RecordsPage } from "./RecordsPage";

const conversations: Conversation[] = [
  {
    id: "c1",
    accountId: "1",
    conversationId: "fixture-conversation-1",
    type: "group",
    name: "项目推进群",
    memberCount: 18,
    messageCount: 4,
    lastMessagePreview: "今晚先确认导出格式，恢复流程单独确认。",
    lastMessageAt: new Date("2026-07-10T09:18:00+08:00"),
    hasAttachments: true,
    backupStatus: "complete",
    isFavorite: true,
    createdAt: new Date("2026-07-01T08:00:00+08:00"),
  },
  {
    id: "c2",
    accountId: "1",
    conversationId: "fixture-conversation-2",
    type: "personal",
    name: "陈晓",
    memberCount: 1,
    messageCount: 3,
    lastMessagePreview: "语音 00:18 · 2 个附件",
    lastMessageAt: new Date("2026-07-09T20:12:00+08:00"),
    hasAttachments: true,
    backupStatus: "partial",
    isFavorite: false,
    createdAt: new Date("2026-07-01T08:00:00+08:00"),
  },
];

const detailsByConversationId: Record<string, ConversationDetail> = {
  c1: {
    conversation: conversations[0] as Conversation,
    risks: [],
    canExport: true,
    canRebackup: false,
  },
  c2: {
    conversation: conversations[1] as Conversation,
    risks: [
      {
        id: "partial",
        severity: "warning",
        title: "附件未完整备份",
        description: "2 个附件只有占位信息。",
        source: "attachment",
      },
    ],
    canExport: true,
    canRebackup: true,
  },
};

const messagesByConversationId: Record<string, Message[]> = {
  c1: [
    message("m1", "c1", "system", "2026-07-10", "系统"),
    message("m2", "c1", "text", "导出格式先用 HTML。", "王然"),
    message("m3", "c1", "file", "会议纪要.pdf", "我", true),
    message("m4", "c1", "red-packet", "转账记录占位", "林小满"),
  ],
  c2: [
    message("m5", "c2", "voice", "语音 00:18，等待转写。", "陈晓", true),
    message("m6", "c2", "image", "合同截图", "我", true),
    message("m7", "c2", "unknown", "[未知消息] 原始类型 10000", "陈晓"),
  ],
};

describe("RecordsPage", () => {
  it("renders the design-reference three-pane chat viewer", () => {
    renderRecordsPage();

    const list = screen.getByRole("region", { name: "会话列表" });
    const messagePane = screen.getByRole("region", { name: "消息预览" });
    const detailPanel = screen.getByRole("region", { name: "会话详情" });

    expect(within(list).getByText("项目推进群")).toBeTruthy();
    expect(within(messagePane).getByText("导出格式先用 HTML。")).toBeTruthy();
    expect(within(messagePane).getByText("会议纪要.pdf")).toBeTruthy();
    expect(within(detailPanel).getByText("导出此会话")).toBeTruthy();
  });

  it("selecting a conversation updates the message stream and detail panel", () => {
    renderRecordsPage();

    fireEvent.click(screen.getByRole("button", { name: /陈晓/ }));

    expect(screen.getByText("语音 00:18，等待转写。")).toBeTruthy();
    expect(screen.getByText("[未知消息] 原始类型 10000")).toBeTruthy();
    expect(screen.getByText("附件未完整备份")).toBeTruthy();
  });

  it("filters conversations with page search and highlights matches", () => {
    renderRecordsPage();

    fireEvent.change(screen.getByRole("textbox", { name: "搜索聊天记录" }), {
      target: { value: "陈晓" },
    });

    const list = screen.getByRole("region", { name: "会话列表" });

    expect(within(list).queryByText("项目推进群")).toBeNull();
    expect(within(list).getByText("陈晓")).toBeTruthy();
    expect(list.querySelector("mark")?.textContent).toBe("陈晓");
  });

  it("syncs the selected conversation when search moves the active row", () => {
    const onSelectedConversationChange = vi.fn();
    const currentDetail = detailsByConversationId.c1;
    const currentMessages = messagesByConversationId.c1;

    if (!currentDetail || !currentMessages) {
      throw new Error("Missing current conversation fixture.");
    }

    render(
      <RecordsPage
        conversations={conversations}
        detailsByConversationId={{ c1: currentDetail }}
        messagesByConversationId={{ c1: currentMessages }}
        onSelectedConversationChange={onSelectedConversationChange}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "搜索聊天记录" }), {
      target: { value: "陈晓" },
    });

    expect(onSelectedConversationChange).toHaveBeenCalledWith("c2");
  });

  it("supports batch selection and export handoff", () => {
    const onNavigate = vi.fn();
    renderRecordsPage({ onNavigate });

    fireEvent.click(screen.getByRole("button", { name: "选择会话" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "选择 项目推进群" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "选择 陈晓" }));

    const batchBar = screen.getByRole("region", { name: "批量操作" });
    expect(within(batchBar).getByText("已选 2 个")).toBeTruthy();

    fireEvent.click(within(batchBar).getByRole("button", { name: "导出" }));

    expect(onNavigate).toHaveBeenCalledWith("transfer", {
      conversationIds: ["c1", "c2"],
      mode: "export",
      source: "records-batch",
    });
  });
});

function renderRecordsPage({
  onNavigate = vi.fn(),
}: {
  onNavigate?: Parameters<typeof RecordsPage>[0]["onNavigate"];
} = {}) {
  return render(
    <RecordsPage
      conversations={conversations}
      detailsByConversationId={detailsByConversationId}
      messagesByConversationId={messagesByConversationId}
      onNavigate={onNavigate}
    />,
  );
}

function message(
  id: string,
  conversationId: string,
  type: Message["type"],
  content: string,
  senderName: string,
  hasAttachment = false,
): Message {
  return {
    id,
    conversationId,
    type,
    content,
    senderName,
    timestamp: new Date("2026-07-10T09:18:00+08:00"),
    hasAttachment,
    createdAt: new Date("2026-07-10T09:18:00+08:00"),
  };
}
