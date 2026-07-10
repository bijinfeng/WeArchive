// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import type { WeArchiveHomeData } from "@we-archive/core/types";
import { describe, expect, it, vi } from "vitest";

import { HomePage } from "./HomePage";

const baseHomeData: WeArchiveHomeData = {
  account: {
    id: 1,
    wxid: "wxid_alice",
    nickname: "Alice",
    avatar: null,
    lastBackupAt: new Date("2026-07-10T09:00:00+08:00"),
  },
  stats: {
    conversationCount: 10,
    messageCount: 60,
    attachmentCount: 8,
    storageSize: 36_864,
    todayNewCount: 6,
    pendingIssues: 0,
  },
  tasks: [
    {
      id: 1,
      status: "completed",
      progress: 100,
      currentStep: "最近一次备份已完成",
      savePath: "/archives/alice",
    },
  ],
  issues: [],
  archiveStatus: {
    id: 1,
    name: "Alice 微信归档",
    health: "ready",
    sourceType: "fixture",
    importedAt: new Date("2026-07-10T09:00:00+08:00"),
  },
};

describe("HomePage", () => {
  it("renders the design-reference dashboard sections in normal state", () => {
    render(<HomePage data={baseHomeData} platformLabel="飞牛 NAS 原生应用" />);

    expect(screen.getByText("备份状态正常")).toBeTruthy();
    expect(screen.getByRole("region", { name: "当前账号卡" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "数据概览" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "最近任务" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "异常提醒" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "快捷操作" })).toBeTruthy();
    expect(screen.getByText("微信账号列表")).toBeTruthy();
  });

  it("renders the needs-attention state when issues exist", () => {
    render(
      <HomePage
        data={{
          ...baseHomeData,
          stats: { ...baseHomeData.stats, pendingIssues: 2 },
          issues: [
            {
              id: "partial-attachments",
              severity: "warning",
              title: "附件未完整备份",
              description: "2 个附件只有占位信息。",
              source: "attachment",
            },
            {
              id: "unknown-messages",
              severity: "warning",
              title: "存在未知消息类型",
              description: "1 条消息将以占位内容展示。",
              source: "message",
            },
          ],
        }}
        platformLabel="飞牛 NAS 原生应用"
      />,
    );

    expect(screen.getByText("有 2 个问题需要处理")).toBeTruthy();
    expect(screen.getByRole("button", { name: "查看问题" })).toBeTruthy();
    expect(screen.getByText("附件未完整备份")).toBeTruthy();
  });

  it("renders the first-use state when no account exists", () => {
    render(
      <HomePage
        data={{
          ...baseHomeData,
          account: null,
          stats: {
            conversationCount: 0,
            messageCount: 0,
            attachmentCount: 0,
            storageSize: 0,
            todayNewCount: 0,
            pendingIssues: 0,
          },
          tasks: [],
          archiveStatus: {
            id: null,
            name: "暂无归档",
            health: "empty",
            importedAt: null,
          },
        }}
        platformLabel="飞牛 NAS 原生应用"
      />,
    );

    expect(screen.getByText("还没有备份微信聊天记录")).toBeTruthy();
    expect(screen.getByRole("button", { name: "开始第一次备份" })).toBeTruthy();
  });

  it("routes KPI clicks to the intended page with filter intent", () => {
    const onNavigate = vi.fn();
    render(
      <HomePage
        data={baseHomeData}
        platformLabel="飞牛 NAS 原生应用"
        onNavigate={onNavigate}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /已备份会话/ }));

    expect(onNavigate).toHaveBeenCalledWith("records", {
      metric: "conversations",
      source: "home-kpi",
    });
  });
});
