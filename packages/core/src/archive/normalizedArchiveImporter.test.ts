import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { closeDatabase, getSqlite, initDatabase } from "../database";
import { weArchiveFixture } from "./fixtureArchive";
import { importNormalizedArchive } from "./normalizedArchiveImporter";

describe("importNormalizedArchive", () => {
  afterEach(() => {
    closeDatabase();
  });

  it("imports the deterministic Archive v0 fixture and reports warnings, unknown types, and duplicates", async () => {
    const databasePath = join(
      mkdtempSync(join(tmpdir(), "wearchive-core-")),
      "archive.sqlite",
    );
    initDatabase(databasePath);

    const firstResult = await importNormalizedArchive(weArchiveFixture);

    expect(firstResult.counts).toEqual({
      accounts: 2,
      contacts: 12,
      conversations: 10,
      messages: 60,
      attachments: 8,
      duplicates: 0,
      warnings: 1,
      unknownTypes: 1,
      taskLogs: 3,
    });

    const sqlite = getSqlite();
    expect(
      sqlite.prepare("SELECT COUNT(*) AS total FROM accounts").get(),
    ).toEqual({ total: 2 });
    expect(
      sqlite.prepare("SELECT COUNT(*) AS total FROM contacts").get(),
    ).toEqual({ total: 12 });
    expect(
      sqlite.prepare("SELECT COUNT(*) AS total FROM conversations").get(),
    ).toEqual({ total: 10 });
    expect(
      sqlite.prepare("SELECT COUNT(*) AS total FROM messages").get(),
    ).toEqual({ total: 60 });
    expect(
      sqlite.prepare("SELECT COUNT(*) AS total FROM attachments").get(),
    ).toEqual({ total: 8 });
    expect(
      sqlite.prepare("SELECT COUNT(*) AS total FROM task_logs").get(),
    ).toEqual({ total: 3 });
    expect(
      sqlite
        .prepare(
          "SELECT COUNT(*) AS total FROM messages WHERE type = 'unknown'",
        )
        .get(),
    ).toEqual({ total: 1 });
    expect(
      sqlite
        .prepare(
          "SELECT COUNT(*) AS total FROM attachments WHERE backup_status = 'partial'",
        )
        .get(),
    ).toEqual({ total: 1 });

    const secondResult = await importNormalizedArchive(weArchiveFixture);

    expect(secondResult.counts.duplicates).toBe(60);
    expect(
      sqlite.prepare("SELECT COUNT(*) AS total FROM messages").get(),
    ).toEqual({ total: 60 });
  });
});
