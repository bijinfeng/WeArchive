// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import {
  countSearchTargets,
  focusFirstSearchTarget,
  getSearchTargetProps,
  SEARCH_TARGET_ATTRIBUTE,
} from "./searchTargets";

describe("search target helpers", () => {
  it("marks page rows as searchable targets", () => {
    expect(getSearchTargetProps("恢复点检查")).toEqual({
      [SEARCH_TARGET_ATTRIBUTE]: "恢复点检查",
      tabIndex: -1,
    });
  });

  it("focuses the first matching target for a non-empty query", () => {
    document.body.innerHTML = `
      <button data-wearchive-search-target="导入旧备份">导入旧备份</button>
      <button data-wearchive-search-target="恢复点检查">恢复点检查</button>
    `;

    expect(focusFirstSearchTarget(document, "恢复")).toBe(true);
    expect(document.activeElement?.textContent).toBe("恢复点检查");
  });

  it("does not move focus when there is no matching target", () => {
    document.body.innerHTML = `
      <button data-wearchive-search-target="导入旧备份">导入旧备份</button>
    `;

    expect(focusFirstSearchTarget(document, "恢复")).toBe(false);
    expect(document.activeElement).toBe(document.body);
  });

  it("counts matching targets in the current page content", () => {
    document.body.innerHTML = `
      <button data-wearchive-search-target="项目群 9 voice 消息">项目群 9</button>
      <button data-wearchive-search-target="项目群 6 group notice">项目群 6</button>
      <button data-wearchive-search-target="聊天 1 transfer 消息">聊天 1</button>
    `;

    expect(countSearchTargets(document, "项目群")).toBe(2);
    expect(countSearchTargets(document, "missing")).toBe(0);
    expect(countSearchTargets(document, "")).toBeNull();
  });
});
