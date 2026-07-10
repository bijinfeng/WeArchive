// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import type { BackupTask } from "@we-archive/core/types";
import { describe, expect, it, vi } from "vitest";

import { TransferPage } from "./TransferPage";

describe("TransferPage", () => {
  it("runs the PRD import demo path through check pause and warning review", () => {
    render(<TransferPage tasks={[]} />);

    expect(screen.getByText("你要从哪里导入聊天记录？")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "本地备份文件" }));
    expect(screen.getByRole("button", { name: "选择备份文件" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "选择备份文件" }));
    expect(screen.getByText("WeArchive-旧电脑备份.wearchive")).toBeTruthy();
    expect(screen.getByRole("button", { name: "开始检查文件" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "开始检查文件" }));
    expect(screen.getByText("正在读取文件")).toBeTruthy();
    expect(screen.getByRole("button", { name: "暂停检查" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "暂停检查" }));
    expect(screen.getByText("已暂停，已读取的内容会保留")).toBeTruthy();
    expect(screen.getByRole("button", { name: "继续检查" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "继续检查" }));
    expect(screen.getByText("发现 6 个需要注意的问题")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "查看警告" }));
    const preview = screen.getByRole("region", { name: "预览与风险" });
    expect(within(preview).getByText("6 个附件路径需要重新定位")).toBeTruthy();
  });

  it("keeps import and export drafts separate while switching modes", () => {
    render(<TransferPage tasks={[]} />);

    fireEvent.click(screen.getByRole("button", { name: "本地备份文件" }));
    fireEvent.click(screen.getByRole("button", { name: "选择备份文件" }));
    fireEvent.click(screen.getByRole("radio", { name: "导出" }));

    expect(screen.getByText("你要导出哪些聊天记录？")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "指定会话" }));
    fireEvent.change(screen.getByLabelText("搜索会话"), {
      target: { value: "客户" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "客户项目群" }));
    expect(screen.getByText("已选 1 个会话")).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: "导入" }));
    expect(screen.getByText("WeArchive-旧电脑备份.wearchive")).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: "导出" }));
    expect(screen.getByText("已选 1 个会话")).toBeTruthy();
  });

  it("creates an export queue item after selecting range, html format, masking, and path", () => {
    const onCreateExportTask = vi.fn();
    render(
      <TransferPage tasks={tasks} onCreateExportTask={onCreateExportTask} />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "导出" }));
    fireEvent.click(screen.getByRole("button", { name: "指定会话" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "客户项目群" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "客户张敏" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "客户售后群" }));
    fireEvent.click(
      screen.getByRole("button", { name: "下一步，选择导出格式" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "HTML 归档" }));
    fireEvent.click(
      screen.getByRole("button", { name: "下一步，设置导出内容" }),
    );

    fireEvent.click(screen.getByRole("switch", { name: "隐藏手机号和微信号" }));
    expect(screen.getByText("138****5678")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "下一步，选择保存位置" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "选择保存位置" }));
    expect(screen.getByText("可以保存")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "开始导出" }));
    expect(onCreateExportTask).toHaveBeenCalledWith({
      conversationIds: [
        "customer-project",
        "customer-zhangmin",
        "customer-after",
      ],
      format: "html",
      targetPath: "/Users/local/Documents/WeArchive/exports",
      maskSensitive: true,
    });
    expect(screen.getByText("客户会话 HTML 归档")).toBeTruthy();
  });

  it("validates encrypted export password before selecting a save location", () => {
    const onCreateExportTask = vi.fn();
    render(
      <TransferPage tasks={tasks} onCreateExportTask={onCreateExportTask} />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "导出" }));
    fireEvent.click(screen.getByRole("button", { name: "指定会话" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "客户项目群" }));
    fireEvent.click(
      screen.getByRole("button", { name: "下一步，选择导出格式" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "HTML 归档" }));
    fireEvent.click(
      screen.getByRole("button", { name: "下一步，设置导出内容" }),
    );

    fireEvent.click(screen.getByRole("switch", { name: "加密导出文件" }));
    fireEvent.change(screen.getByLabelText("导出密码"), {
      target: { value: "123456" },
    });
    expect(screen.getByText("密码至少 8 位")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "下一步，选择保存位置" }),
    );
    expect(screen.queryByText("导出的文件要保存到哪里？")).toBeFalsy();

    fireEvent.change(screen.getByLabelText("导出密码"), {
      target: { value: "archive-2026" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "下一步，选择保存位置" }),
    );
    expect(
      screen.getAllByText("导出的文件要保存到哪里？").length,
    ).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "选择保存位置" }));
    fireEvent.click(screen.getByRole("button", { name: "开始导出" }));

    expect(onCreateExportTask).toHaveBeenCalledWith(
      expect.objectContaining({
        encrypted: true,
        password: "archive-2026",
      }),
    );
  });
});

const tasks: BackupTask[] = [
  {
    id: 8,
    accountId: 1,
    title: "旧电脑导入任务",
    accountName: "Alice",
    scope: "本地备份文件",
    status: "paused",
    progress: 42,
    currentStep: "已暂停，已完成部分会保留",
    startedAt: new Date("2026-07-10T09:24:00+08:00"),
    completedAt: null,
    elapsedTime: 240,
    savePath: "/Users/local/Documents/WeArchive",
    errorCount: 0,
    warningCount: 6,
  },
];
