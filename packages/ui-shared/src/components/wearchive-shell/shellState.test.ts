import { describe, expect, it, vi } from "vitest";

import {
  readStoredSideNavCollapsed,
  writeStoredSideNavCollapsed,
} from "./shellState";

describe("side nav collapse persistence", () => {
  it("reads a stored collapsed state and ignores invalid values", () => {
    const storage = new Map<string, string>();
    const localStorageLike = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
    };

    expect(readStoredSideNavCollapsed(localStorageLike)).toBeNull();

    storage.set("wearchive.shell.sideNavCollapsed", "true");
    expect(readStoredSideNavCollapsed(localStorageLike)).toBe(true);

    storage.set("wearchive.shell.sideNavCollapsed", "false");
    expect(readStoredSideNavCollapsed(localStorageLike)).toBe(false);

    storage.set("wearchive.shell.sideNavCollapsed", "expanded");
    expect(readStoredSideNavCollapsed(localStorageLike)).toBeNull();
  });

  it("writes collapsed state without throwing when storage is unavailable", () => {
    const setItem = vi.fn();
    const brokenStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem,
    };

    expect(readStoredSideNavCollapsed(brokenStorage)).toBeNull();
    expect(() =>
      writeStoredSideNavCollapsed(brokenStorage, true),
    ).not.toThrow();
  });
});
