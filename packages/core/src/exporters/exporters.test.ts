import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  writeCsvArchiveExport,
  writeHtmlArchiveExport,
  writeJsonArchiveExport,
} from "./index";

describe("MVP archive exporters", () => {
  it("writes HTML, CSV, and JSON export artifacts with masking support", async () => {
    const targetDir = await mkdtemp(join(tmpdir(), "wearchive-export-"));

    try {
      const input = {
        targetDir,
        baseName: "customer-export",
        maskSensitive: true,
        conversations: [
          { id: "c1", name: "客户张敏" },
          { id: "c2", name: "客户项目群" },
        ],
        messages: [
          {
            id: "m1",
            conversationId: "c1",
            senderName: "张敏",
            type: "text",
            content: "手机号 13800005678，微信 wxid_customer_client",
            timestamp: new Date("2026-07-10T10:00:00+08:00"),
          },
          {
            id: "m2",
            conversationId: "c2",
            senderName: "Alice",
            type: "file",
            content: "报价单-final.xlsx",
            timestamp: new Date("2026-07-10T10:01:00+08:00"),
          },
        ],
      };

      const html = await writeHtmlArchiveExport(input);
      const csv = await writeCsvArchiveExport(input);
      const json = await writeJsonArchiveExport(input);

      await expect(readFile(html.filePath, "utf8")).resolves.toContain(
        "客户张敏",
      );
      await expect(readFile(html.filePath, "utf8")).resolves.toContain(
        "138****5678",
      );
      await expect(readFile(csv.filePath, "utf8")).resolves.toContain(
        "conversation,sender,type,timestamp,content",
      );
      await expect(readFile(json.filePath, "utf8")).resolves.toContain(
        '"messageCount": 2',
      );
      expect([html.format, csv.format, json.format]).toEqual([
        "html",
        "csv",
        "json",
      ]);
    } finally {
      await rm(targetDir, { force: true, recursive: true });
    }
  });
});
