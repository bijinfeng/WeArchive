// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import type { Message, MessageType } from "@we-archive/core/types";
import { describe, expect, it } from "vitest";

import { MessageContent } from "./messageRenderers";

const typedMessages: Array<[MessageType, string, string]> = [
  ["link", "https://example.com/report", "链接预览"],
  ["miniprogram", "审批小程序", "小程序卡片"],
  ["location", "深圳湾一号", "位置"],
  ["contact-card", "陈晓", "联系人名片"],
  ["group-notice", "周会改到 10 点", "群公告"],
  ["merged", "客户沟通记录", "合并聊天记录"],
  ["transfer", "转账 128.00", "转账"],
  ["red-packet", "红包已领取", "红包"],
  ["unknown", "原始类型 10000", "未知"],
];

describe("MessageContent", () => {
  it("renders PRD message type placeholders with readable labels", () => {
    for (const [type, content, label] of typedMessages) {
      const { unmount } = render(
        <MessageContent message={message(type, content)} query="" />,
      );

      expect(screen.getByText(label)).toBeTruthy();
      expect(screen.getByText(content)).toBeTruthy();
      expect(screen.queryByText(/MVP/)).toBeNull();
      unmount();
    }
  });
});

function message(type: MessageType, content: string): Message {
  return {
    id: `${type}-message`,
    conversationId: "conversation-1",
    type,
    content,
    senderName: "陈晓",
    timestamp: new Date("2026-07-10T09:18:00+08:00"),
    hasAttachment: false,
    createdAt: new Date("2026-07-10T09:18:00+08:00"),
  };
}
