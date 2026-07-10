// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SettingsPage } from "./SettingsPage";

describe("SettingsPage", () => {
  it("filters settings, checks paths, saves switches, and validates security password", async () => {
    const onSaveSetting = vi.fn().mockResolvedValue(undefined);
    const onCheckPath = vi.fn().mockResolvedValue(true);

    render(
      <SettingsPage
        query=""
        onSaveSetting={onSaveSetting}
        onCheckPath={onCheckPath}
      />,
    );

    fireEvent.click(
      screen.getByRole("switch", { name: "默认隐藏手机号和微信号" }),
    );
    await waitFor(() =>
      expect(onSaveSetting).toHaveBeenCalledWith(
        "export.maskSensitiveDefault",
        true,
      ),
    );
    expect(screen.getByText("已保存 默认隐藏手机号和微信号")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "检查备份路径" }));
    await waitFor(() =>
      expect(onCheckPath).toHaveBeenCalledWith(
        "backup.path",
        "/Users/local/Documents/WeArchive",
      ),
    );
    expect(screen.getByText("路径可写")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("本地加密密码"), {
      target: { value: "archive-2026" },
    });
    expect(screen.getByText("强度：可用")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("搜索设置"), {
      target: { value: "安全" },
    });
    expect(screen.getByText("安全")).toBeTruthy();
    expect(screen.queryByText("通知")).toBeFalsy();
  });
});
