import type { BackupTask } from "@we-archive/core/types";
import { describe, expect, it } from "vitest";

import {
  getTaskActions,
  getTaskStatusMeta,
  summarizeTasks,
} from "./tasksModel";

describe("tasksModel", () => {
  it("maps PRD task statuses to user-facing copy and actions", () => {
    expect(getTaskStatusMeta("waiting").label).toBe("等待开始");
    expect(
      getTaskActions(task("waiting")).map((action) => action.label),
    ).toEqual(["提前开始", "取消"]);

    expect(getTaskStatusMeta("scanning").label).toBe("正在查找聊天记录");
    expect(
      getTaskActions(task("scanning")).map((action) => action.label),
    ).toEqual(["暂停", "查看详情"]);

    expect(getTaskStatusMeta("backing-up").label).toBe("正在备份聊天记录");
    expect(getTaskStatusMeta("verifying").label).toBe("正在检查备份是否完整");
    expect(
      getTaskActions(task("paused")).map((action) => action.label),
    ).toEqual(["继续", "取消"]);
    expect(
      getTaskActions(task("completed")).map((action) => action.label),
    ).toEqual(["打开位置", "查看报告"]);
    expect(
      getTaskActions(task("partial")).map((action) => action.label),
    ).toEqual(["查看问题", "重试失败项"]);
    expect(
      getTaskActions(task("failed")).map((action) => action.label),
    ).toEqual(["重试", "查看日志"]);
    expect(
      getTaskActions(task("cancelled")).map((action) => action.label),
    ).toEqual(["删除记录"]);
  });

  it("summarizes the task board counters", () => {
    expect(
      summarizeTasks([
        task("waiting"),
        task("scanning"),
        task("backing-up"),
        task("verifying"),
        task("paused"),
        task("partial"),
        task("failed"),
        task("completed"),
      ]),
    ).toEqual({
      inProgress: 3,
      waiting: 1,
      paused: 1,
      needsAttention: 2,
    });
  });
});

function task(status: BackupTask["status"]): BackupTask {
  return {
    id: 1,
    accountId: 1,
    status,
    progress: status === "completed" ? 100 : 40,
    currentStep: null,
    startedAt: new Date("2026-07-10T09:24:00+08:00"),
    completedAt: null,
    elapsedTime: 120,
    savePath: "/Users/local/Documents/WeArchive",
    errorCount: status === "failed" ? 1 : 0,
    warningCount: status === "partial" ? 2 : 0,
  };
}
