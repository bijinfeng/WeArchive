import { describe, expect, it } from "vitest";

import {
  getWeArchivePathFromView,
  getWeArchiveViewFromPathname,
} from "./routes";

describe("WeArchive shell routes", () => {
  it("maps shell views to stable route paths", () => {
    expect(getWeArchivePathFromView("overview")).toBe("/");
    expect(getWeArchivePathFromView("records")).toBe("/chat-records");
    expect(getWeArchivePathFromView("backup")).toBe("/backup-tasks");
    expect(getWeArchivePathFromView("transfer")).toBe("/import-export");
    expect(getWeArchivePathFromView("restore")).toBe("/restore");
    expect(getWeArchivePathFromView("settings")).toBe("/settings");
  });

  it("resolves view ids from root and fnOS basepath routes", () => {
    expect(getWeArchiveViewFromPathname("/")).toBe("overview");
    expect(getWeArchiveViewFromPathname("/chat-records")).toBe("records");
    expect(getWeArchiveViewFromPathname("/app/wearchive/")).toBe("overview");
    expect(getWeArchiveViewFromPathname("/app/wearchive/import-export")).toBe(
      "transfer",
    );
    expect(getWeArchiveViewFromPathname("/unknown")).toBe("overview");
  });
});
