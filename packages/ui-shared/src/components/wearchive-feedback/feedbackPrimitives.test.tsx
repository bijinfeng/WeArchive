// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ConfirmDialog } from "./ConfirmDialog";
import { DisabledReason } from "./DisabledReason";
import { EmptyAction } from "./EmptyAction";

describe("WeArchive feedback primitives", () => {
  it("renders a compact disabled reason with the reason text", () => {
    render(
      <DisabledReason title="恢复执行已禁用" reason="MVP 仅支持检查和预览" />,
    );

    expect(screen.getByText("恢复执行已禁用")).toBeTruthy();
    expect(screen.getByText("MVP 仅支持检查和预览")).toBeTruthy();
  });

  it("renders an empty action with the primary action", () => {
    render(
      <EmptyAction
        title="暂无备份任务"
        description="创建一次备份后会显示任务进度"
        actionLabel="立即备份"
        onAction={vi.fn()}
      />,
    );

    expect(screen.getByText("暂无备份任务")).toBeTruthy();
    expect(screen.getByRole("button", { name: "立即备份" })).toBeTruthy();
  });

  it("renders confirm dialog content inline for previews and tests", () => {
    render(
      <ConfirmDialog
        isOpen
        isInline
        title="取消导出任务？"
        description="任务取消后可以重新创建"
        confirmLabel="取消任务"
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText("取消导出任务？")).toBeTruthy();
    expect(screen.getByRole("button", { name: "取消任务" })).toBeTruthy();
  });

  it("closes confirm dialog when Escape is pressed", () => {
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        isOpen
        isInline
        title="取消导出任务？"
        description="任务取消后可以重新创建"
        confirmLabel="取消任务"
        onOpenChange={onOpenChange}
        onConfirm={vi.fn()}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
