// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type {
  RestorePointSummary,
  RestoreStrategyPreview,
} from "@we-archive/core/types";
import { describe, expect, it, vi } from "vitest";

import { RestorePage } from "./RestorePage";

describe("RestorePage", () => {
  it("checks restore points and blocks destructive restore execution with a reason", async () => {
    const onCheckPoint = vi.fn().mockResolvedValue(points[0]);
    const onPreviewStrategy = vi.fn().mockResolvedValue(overwritePreview);
    const onExecuteRestore = vi.fn();

    render(
      <RestorePage
        query=""
        points={points}
        preview={overwritePreview}
        onCheckPoint={onCheckPoint}
        onPreviewStrategy={onPreviewStrategy}
        onExecuteRestore={onExecuteRestore}
      />,
    );

    expect(screen.getByText("WeArchive MVP Fixture 恢复点")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "检查恢复点" }));
    await waitFor(() => expect(onCheckPoint).toHaveBeenCalledWith(1));
    expect(screen.getByText("检查通过")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "覆盖当前归档" }));
    await waitFor(() =>
      expect(onPreviewStrategy).toHaveBeenCalledWith({
        strategy: "overwrite",
        restorePointId: 1,
      }),
    );
    expect(screen.getByText("恢复执行已禁用")).toBeTruthy();
    expect(
      screen.getAllByText(
        "MVP 仅支持检查和预览恢复影响，覆盖当前数据将在恢复执行版本开放。",
      ).length,
    ).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("checkbox", { name: "我理解覆盖风险" }));
    fireEvent.click(screen.getByRole("button", { name: "执行恢复" }));
    expect(onExecuteRestore).not.toHaveBeenCalled();
  });
});

const points: RestorePointSummary[] = [
  {
    id: 1,
    archiveId: 1,
    name: "WeArchive MVP Fixture 恢复点",
    status: "available",
    checkedAt: new Date("2026-07-10T10:00:00+08:00"),
    createdAt: new Date("2026-07-10T09:00:00+08:00"),
  },
];

const overwritePreview: RestoreStrategyPreview = {
  strategy: "overwrite",
  disabledReason:
    "MVP 仅支持检查和预览恢复影响，覆盖当前数据将在恢复执行版本开放。",
  risks: [
    {
      id: "restore-overwrite-disabled",
      severity: "error",
      title: "恢复执行暂未开放",
      description:
        "MVP 仅支持检查和预览恢复影响，覆盖当前数据将在恢复执行版本开放。",
      source: "restore",
    },
  ],
};
