import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { weArchiveFixture } from "../archive";
import { closeDatabase, initDatabase } from "../database";
import { seedFixtureArchiveIfEmpty } from "./archiveRepository";
import {
  getConversationDetail,
  listConversations,
} from "./conversationRepository";
import { listMessages } from "./messageRepository";
import { getOverviewData } from "./overviewRepository";
import {
  checkRestorePoint,
  executeRestore,
  listRestorePoints,
  previewRestoreStrategy,
} from "./restoreRepository";
import { getSetting, rollbackSetting, setSetting } from "./settingsRepository";
import {
  cancelTask,
  createFailedTask,
  createTask,
  listTaskLogs,
  listTasks,
  pauseTask,
  resumeTask,
  retryTask,
  startTask,
} from "./taskRepository";
import {
  executeExport,
  executeFixtureImport,
  planExportDraft,
  planImportDraft,
} from "./transferRepository";

describe("WeArchive core repositories", () => {
  beforeEach(async () => {
    const databasePath = join(
      mkdtempSync(join(tmpdir(), "wearchive-repositories-")),
      "archive.sqlite",
    );
    initDatabase(databasePath);
    await expect(seedFixtureArchiveIfEmpty()).resolves.toBe(true);
    await expect(seedFixtureArchiveIfEmpty()).resolves.toBe(false);
  });

  afterEach(() => {
    closeDatabase();
  });

  it("returns page-ready data from the normalized archive fixture", async () => {
    const overview = await getOverviewData();

    expect(overview.account?.nickname).toBe("Alice");
    expect(overview.stats).toMatchObject({
      conversationCount: 10,
      messageCount: 60,
      attachmentCount: 8,
      pendingIssues: 2,
    });
    expect(overview.archiveStatus.health).toBe("attention");

    const allConversations = await listConversations({ limit: 20, offset: 0 });
    expect(allConversations.total).toBe(10);
    expect(allConversations.items[0]).toMatchObject({
      conversationId: "fixture-conversation-10",
      messageCount: 6,
    });

    const groupConversations = await listConversations({
      type: "group",
      limit: 20,
      offset: 0,
    });
    expect(groupConversations.total).toBe(3);

    const conversationsWithAttachments = await listConversations({
      hasAttachments: true,
      limit: 20,
      offset: 0,
    });
    expect(conversationsWithAttachments.total).toBe(2);

    const firstConversation = allConversations.items[0];
    if (!firstConversation) {
      throw new Error("Expected at least one fixture conversation");
    }

    const detail = await getConversationDetail(firstConversation.id);
    expect(detail.conversation.id).toBe(firstConversation.id);
    expect(detail.canExport).toBe(true);

    const messages = await listMessages({
      conversationId: firstConversation.id,
      limit: 20,
    });
    expect(messages.total).toBe(6);

    const unknownMessages = await listMessages({
      messageType: "unknown",
      conversationId: "fixture-conversation-3",
      limit: 20,
    });
    expect(unknownMessages.total).toBe(1);

    const importPlan = await planImportDraft(weArchiveFixture);
    expect(importPlan.counts.messages).toBe(60);
    expect(importPlan.warnings).toHaveLength(1);

    const exportPlan = await planExportDraft({
      conversationIds: [firstConversation.id],
      format: "html",
    });
    expect(exportPlan.conversationCount).toBe(1);
    expect(exportPlan.messageCount).toBe(6);

    const firstWrite = await setSetting("export.defaultFormat", "html");
    expect(firstWrite).toMatchObject({
      key: "export.defaultFormat",
      value: "html",
      previousValue: null,
      rollbackValue: null,
      previousExists: false,
    });
    await expect(getSetting("export.defaultFormat")).resolves.toBe("html");
    const secondWrite = await setSetting("export.defaultFormat", "json");
    expect(secondWrite).toMatchObject({
      key: "export.defaultFormat",
      value: "json",
      previousValue: "html",
      rollbackValue: "html",
      previousExists: true,
    });
    await rollbackSetting(secondWrite);
    await expect(getSetting("export.defaultFormat")).resolves.toBe("html");

    const task = await createTask({
      accountId: Number(firstConversation.accountId),
      savePath: "/tmp/wearchive",
      currentStep: "等待导出",
    });
    expect(task.title).toContain("导出任务");
    expect(task.accountName).toBeTruthy();
    const startedTask = await startTask(task.id);
    expect(startedTask.status).toBe("scanning");
    expect(startedTask.currentStep).toBe("正在查找聊天记录");
    const pausedTask = await pauseTask(task.id);
    expect(pausedTask.currentStep).toBe("已暂停，已完成部分会保留");
    const resumedTask = await resumeTask(task.id);
    expect(resumedTask.status).toBe("backing-up");
    await cancelTask(task.id);
    await retryTask(task.id);

    const failedTask = await createFailedTask({
      accountId: Number(firstConversation.accountId),
      savePath: "/tmp/wearchive-failed",
      currentStep: "连接中断",
    });
    expect(failedTask.status).toBe("failed");
    expect(failedTask.currentStep).toBe("连接中断");
    const retriedFailedTask = await retryTask(failedTask.id);
    expect(retriedFailedTask.status).toBe("waiting");
    expect(retriedFailedTask.currentStep).toBe("等待重试");

    const tasks = await listTasks();
    expect(tasks[0]?.status).toBe("waiting");

    const logs = await listTaskLogs({ importJobId: 1, level: "warn" });
    expect(logs).toHaveLength(1);

    const restorePreview = await previewRestoreStrategy({
      strategy: "overwrite",
    });
    expect(restorePreview.disabledReason).toContain(
      "MVP 仅支持检查和预览恢复影响",
    );
    await expect(executeRestore({ strategy: "overwrite" })).resolves.toEqual({
      ok: false,
      disabledReason: restorePreview.disabledReason,
    });

    const restorePoints = await listRestorePoints();
    expect(restorePoints.length).toBeGreaterThan(0);
    expect(restorePoints[0]?.name).toContain("WeArchive MVP Fixture");
    await expect(
      checkRestorePoint(restorePoints[0]?.id ?? 0),
    ).resolves.toMatchObject({
      status: "available",
    });
  });

  it("executes the MVP import path with the normalized fixture", async () => {
    closeDatabase();
    const databasePath = join(
      mkdtempSync(join(tmpdir(), "wearchive-import-execution-")),
      "archive.sqlite",
    );
    initDatabase(databasePath);

    const result = await executeFixtureImport({
      sourcePath: "/Users/local/Downloads/WeArchive-旧电脑备份.wearchive",
    });

    expect(result.importJobId).toBeGreaterThan(0);
    expect(result.counts).toMatchObject({
      accounts: 2,
      contacts: 12,
      conversations: 10,
      messages: 60,
      attachments: 8,
      warnings: 1,
      unknownTypes: 1,
      taskLogs: 3,
    });
    expect(result.warnings[0]?.source).toBe("archive");
    await expect(
      listConversations({ limit: 20, offset: 0 }),
    ).resolves.toMatchObject({
      total: 10,
    });
  });

  it("executes the MVP export path and writes HTML CSV and JSON artifacts", async () => {
    const targetDir = mkdtempSync(
      join(tmpdir(), "wearchive-repository-export-"),
    );
    const conversations = await listConversations({ limit: 2, offset: 0 });

    const result = await executeExport({
      conversationIds: conversations.items.map(
        (conversation) => conversation.id,
      ),
      format: "html",
      targetDir,
      baseName: "客户会话 HTML 归档",
      maskSensitive: true,
    });

    expect(result.exportJobId).toBeGreaterThan(0);
    expect(result.conversationCount).toBe(2);
    expect(result.messageCount).toBe(12);
    expect(result.artifacts.map((artifact) => artifact.format)).toEqual([
      "html",
      "csv",
      "json",
    ]);
    for (const artifact of result.artifacts) {
      expect(existsSync(artifact.filePath)).toBe(true);
    }
    const firstArtifact = result.artifacts[0];

    if (!firstArtifact) {
      throw new Error("Expected at least one export artifact");
    }

    expect(readFileSync(firstArtifact.filePath, "utf8")).toContain(
      "WeArchive HTML 归档",
    );

    const logs = await listTaskLogs({
      exportJobId: result.exportJobId,
      level: "info",
    });
    expect(logs.at(-1)?.message).toBe("导出完成");
  });
});
