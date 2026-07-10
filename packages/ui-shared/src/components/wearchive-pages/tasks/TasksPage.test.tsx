// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import type { BackupTask, TaskLog } from "@we-archive/core/types";
import { describe, expect, it, vi } from "vitest";

import { TasksPage } from "./TasksPage";

describe("TasksPage", () => {
  it("renders the design-reference task board summary and rows", () => {
    render(<TasksPage tasks={tasks} logsByTaskId={logsByTaskId} />);

    const summary = screen.getByRole("region", { name: "任务概览" });
    expect(within(summary).getByText("进行中")).toBeTruthy();
    expect(within(summary).getByText("等待开始")).toBeTruthy();
    expect(within(summary).getByText("已暂停")).toBeTruthy();
    expect(within(summary).getByText("需处理")).toBeTruthy();

    expect(
      screen.getByRole("region", { name: "任务 林小满增量备份" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("region", { name: "任务 导入旧电脑备份" }),
    ).toBeTruthy();
    expect(screen.getByText("正在保存附件")).toBeTruthy();
  });

  it("updates task state immediately for pause and resume actions", () => {
    const onTaskAction = vi.fn();
    render(
      <TasksPage
        tasks={[tasks[0] as BackupTask]}
        logsByTaskId={logsByTaskId}
        onTaskAction={onTaskAction}
      />,
    );

    const row = screen.getByRole("region", { name: "任务 林小满增量备份" });
    fireEvent.click(within(row).getByRole("button", { name: "暂停" }));

    expect(within(row).getByText("已暂停，已完成部分会保留")).toBeTruthy();
    expect(within(row).getByRole("button", { name: "继续" })).toBeTruthy();
    expect(onTaskAction).toHaveBeenCalledWith("pause", 1);
  });

  it("confirms cancel with the exact PRD risk wording", () => {
    const onTaskAction = vi.fn();
    render(
      <TasksPage
        tasks={[tasks[2] as BackupTask]}
        logsByTaskId={logsByTaskId}
        onTaskAction={onTaskAction}
      />,
    );

    const row = screen.getByRole("region", { name: "任务 导入旧电脑备份" });
    fireEvent.click(within(row).getByRole("button", { name: "取消" }));

    expect(
      screen.getByText(
        "确定取消这个任务吗？已完成的备份会保留，未完成部分不会继续。",
      ),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "取消任务" }));

    expect(within(row).getByText("已取消")).toBeTruthy();
    expect(onTaskAction).toHaveBeenCalledWith("cancel", 3);
  });

  it("opens task detail with log filtering actions", () => {
    render(
      <TasksPage
        tasks={[tasks[3] as BackupTask]}
        logsByTaskId={logsByTaskId}
      />,
    );

    const row = screen.getByRole("region", { name: "任务 恢复到工作微信" });
    fireEvent.click(within(row).getByRole("button", { name: "查看日志" }));

    const detail = screen.getByRole("dialog", {
      name: "恢复到工作微信 - 详情",
    });
    expect(within(detail).getByText("日志")).toBeTruthy();
    expect(within(detail).getByRole("radio", { name: "全部" })).toBeTruthy();
    expect(within(detail).getByRole("radio", { name: "错误" })).toBeTruthy();
    expect(
      within(detail).getByRole("button", { name: "复制错误" }),
    ).toBeTruthy();
    expect(
      within(detail).getByRole("button", { name: "导出日志" }),
    ).toBeTruthy();
  });

  it("retries a failed task and returns it to the queue", () => {
    const onTaskAction = vi.fn();
    render(
      <TasksPage
        tasks={[tasks[3] as BackupTask]}
        logsByTaskId={logsByTaskId}
        onTaskAction={onTaskAction}
      />,
    );

    const row = screen.getByRole("region", { name: "任务 恢复到工作微信" });
    fireEvent.click(within(row).getByRole("button", { name: "重试" }));

    expect(within(row).getByText("等待重试")).toBeTruthy();
    expect(within(row).getByRole("button", { name: "提前开始" })).toBeTruthy();
    expect(onTaskAction).toHaveBeenCalledWith("retry", 4);
  });
});

const tasks: BackupTask[] = [
  task(1, "scanning", "林小满增量备份", "正在保存附件", 62),
  task(2, "waiting", "家庭群 HTML 归档", "等待选择保存位置", 0),
  task(3, "paused", "导入旧电脑备份", "正在生成搜索目录", 48),
  task(4, "failed", "恢复到工作微信", "连接中断", 34),
];

const logsByTaskId: Record<number, TaskLog[]> = {
  4: [
    log(4, "info", "目标设备扫码成功"),
    log(4, "warn", "检测到目标账号与恢复记录不一致"),
    log(4, "error", "目标设备断网，恢复中断"),
  ],
};

function task(
  id: number,
  status: BackupTask["status"],
  title: string,
  currentStep: string,
  progress: number,
): BackupTask {
  return {
    id,
    accountId: 1,
    title,
    accountName: "林小满",
    scope: "全部会话",
    status,
    progress,
    currentStep,
    startedAt: new Date("2026-07-10T09:24:00+08:00"),
    completedAt: null,
    elapsedTime: 120,
    savePath: "/Users/local/Documents/WeArchive",
    errorCount: status === "failed" ? 3 : 0,
    warningCount: status === "paused" ? 4 : 0,
  };
}

function log(
  taskId: number,
  level: TaskLog["level"],
  message: string,
): TaskLog {
  return {
    id: taskId * 10,
    taskId,
    importJobId: null,
    exportJobId: null,
    level,
    message,
    metadata: null,
    createdAt: new Date("2026-07-10T09:24:00+08:00"),
  };
}
