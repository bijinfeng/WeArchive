import { describe, expect, it } from "vitest";

import { weArchiveTheme } from "./weArchiveTheme";

describe("weArchiveTheme", () => {
  it("uses WeChat green for the shared app accent and selected navigation state", () => {
    const theme = weArchiveTheme as {
      tokens: Record<string, unknown>;
      components: Record<string, Record<string, Record<string, string>>>;
    };

    const selectedNavItem =
      theme.components["side-nav-item"]?.["selected:selected"];

    expect(theme.tokens["--color-accent"]).toBe("light-dark(#07C160, #39D978)");
    expect(selectedNavItem).toMatchObject({
      "--color-icon-primary": "var(--color-icon-accent)",
      backgroundColor: "var(--color-accent-muted)",
      color: "var(--color-text-accent)",
    });
  });
});
