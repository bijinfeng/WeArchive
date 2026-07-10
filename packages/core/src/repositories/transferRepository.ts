import {
  importNormalizedArchive,
  type NormalizedArchiveInput,
  weArchiveFixture,
} from "../archive";
import { getSqlite } from "../database";
import {
  type ArchiveExportArtifactResult,
  writeCsvArchiveExport,
  writeHtmlArchiveExport,
  writeJsonArchiveExport,
} from "../exporters";
import type {
  ExecuteExportInput,
  ExecuteExportResult,
  ExecuteImportInput,
  ExecuteImportResult,
  ExportDraftInput,
  ExportDraftPlan,
  ImportDraftPlan,
  WeArchiveIssue,
} from "../types";

interface ExportConversationRow {
  id: number;
  conversationId: string;
  stableId: string | null;
  name: string;
}

interface ExportMessageRow {
  id: number;
  stableId: string | null;
  messageId: string | null;
  conversationDbId: number;
  senderName: string | null;
  type: string;
  content: string | null;
  timestamp: number;
}

function readMessageCountForConversation(
  conversationId: string | number,
): number {
  const row = getSqlite()
    .prepare(
      `
      SELECT COUNT(*) AS total
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE c.id = ? OR c.stable_id = ? OR c.conversation_id = ?
    `,
    )
    .get(conversationId, String(conversationId), String(conversationId)) as {
    total: number;
  };

  return row.total;
}

export async function planImportDraft(
  input: NormalizedArchiveInput,
): Promise<ImportDraftPlan> {
  const warnings = mapImportWarnings(input);

  return {
    counts: {
      accounts: input.accounts.length,
      contacts: input.contacts.length,
      conversations: input.conversations.length,
      messages: input.messages.length,
      attachments: input.attachments.length,
    },
    warnings,
  };
}

export async function planExportDraft(
  input: ExportDraftInput,
): Promise<ExportDraftPlan> {
  const messageCount = input.conversationIds.reduce<number>(
    (total, conversationId) =>
      total + readMessageCountForConversation(conversationId),
    0,
  );

  return {
    format: input.format,
    conversationCount: input.conversationIds.length,
    messageCount,
    estimatedSize: messageCount * 1024,
    warnings: [],
  };
}

export async function executeFixtureImport(
  input: ExecuteImportInput = {},
): Promise<ExecuteImportResult> {
  const fixtureInput: NormalizedArchiveInput = {
    ...weArchiveFixture,
    metadata: {
      ...weArchiveFixture.metadata,
      ...(input.sourcePath || weArchiveFixture.metadata.sourcePath
        ? {
            sourcePath:
              input.sourcePath ?? weArchiveFixture.metadata.sourcePath,
          }
        : {}),
    },
  };
  const result = await importNormalizedArchive(fixtureInput);

  return {
    archiveId: result.archiveId,
    importJobId: result.importJobId,
    counts: result.counts,
    warnings: mapImportWarnings(fixtureInput),
  };
}

export async function executeExport(
  input: ExecuteExportInput,
): Promise<ExecuteExportResult> {
  const conversations = readExportConversations(input.conversationIds);

  if (conversations.length === 0) {
    throw new Error("No conversations were selected for export");
  }

  const messages = readExportMessages(conversations.map((row) => row.id));
  const artifactInput = {
    targetDir: input.targetDir,
    baseName: input.baseName ?? `wearchive-export-${Date.now()}`,
    maskSensitive: input.maskSensitive ?? false,
    conversations: conversations.map((conversation) => ({
      id: String(conversation.id),
      name: conversation.name,
    })),
    messages: messages.map((message) => ({
      id: message.stableId ?? message.messageId ?? String(message.id),
      conversationId: String(message.conversationDbId),
      senderName: message.senderName ?? "未知成员",
      type: message.type,
      content: message.content ?? "",
      timestamp: new Date(message.timestamp),
    })),
  };
  const sqlite = getSqlite();
  const now = Date.now();
  const archiveId = readLatestArchiveId();
  const exportJobId = Number(
    sqlite
      .prepare(
        `
        INSERT INTO export_jobs (
          archive_id, status, format, target_path, warning_count, started_at, created_at
        )
        VALUES (?, 'running', ?, ?, 0, ?, ?)
      `,
      )
      .run(archiveId, input.format, input.targetDir, now, now).lastInsertRowid,
  );

  try {
    const artifacts = await writeAllExportArtifacts(artifactInput);
    const result: ExecuteExportResult = {
      exportJobId,
      artifacts: artifacts.map(mapArtifact),
      conversationCount: conversations.length,
      messageCount: messages.length,
      warnings: [],
    };

    sqlite
      .prepare(
        `
        UPDATE export_jobs
        SET status = 'completed',
          summary_json = ?,
          completed_at = ?
        WHERE id = ?
      `,
      )
      .run(JSON.stringify(result), Date.now(), exportJobId);
    insertExportLog(exportJobId, "info", "导出完成", {
      artifactCount: result.artifacts.length,
      messageCount: result.messageCount,
    });

    return result;
  } catch (error) {
    sqlite
      .prepare(
        `
        UPDATE export_jobs
        SET status = 'failed',
          summary_json = ?,
          completed_at = ?
        WHERE id = ?
      `,
      )
      .run(
        JSON.stringify({
          error: error instanceof Error ? error.message : error,
        }),
        Date.now(),
        exportJobId,
      );
    insertExportLog(exportJobId, "error", "导出失败", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

function mapImportWarnings(input: NormalizedArchiveInput): WeArchiveIssue[] {
  return input.warnings.map((warning) => ({
    id: warning.stableId ?? warning.code,
    severity: "warning",
    title: warning.code,
    description: warning.message,
    source: "archive",
  }));
}

function readExportConversations(
  conversationIds: Array<string | number>,
): ExportConversationRow[] {
  if (conversationIds.length === 0) {
    return [];
  }

  const placeholders = conversationIds.map(() => "?").join(", ");
  const idArgs = conversationIds.map((conversationId) =>
    Number(conversationId),
  );
  const stringArgs = conversationIds.map((conversationId) =>
    String(conversationId),
  );

  return getSqlite()
    .prepare(
      `
      SELECT
        id,
        conversation_id AS conversationId,
        stable_id AS stableId,
        name
      FROM conversations
      WHERE id IN (${placeholders})
        OR stable_id IN (${placeholders})
        OR conversation_id IN (${placeholders})
      ORDER BY last_message_at DESC, id DESC
    `,
    )
    .all(...idArgs, ...stringArgs, ...stringArgs) as ExportConversationRow[];
}

function readExportMessages(conversationDbIds: number[]): ExportMessageRow[] {
  if (conversationDbIds.length === 0) {
    return [];
  }

  const placeholders = conversationDbIds.map(() => "?").join(", ");

  return getSqlite()
    .prepare(
      `
      SELECT
        id,
        stable_id AS stableId,
        message_id AS messageId,
        conversation_id AS conversationDbId,
        sender_name AS senderName,
        type,
        content,
        timestamp
      FROM messages
      WHERE conversation_id IN (${placeholders})
      ORDER BY conversation_id ASC, timestamp ASC, id ASC
    `,
    )
    .all(...conversationDbIds) as ExportMessageRow[];
}

function readLatestArchiveId(): number | null {
  const row = getSqlite()
    .prepare(
      `
      SELECT id
      FROM archives
      ORDER BY imported_at DESC, created_at DESC, id DESC
      LIMIT 1
    `,
    )
    .get() as { id: number } | undefined;

  return row?.id ?? null;
}

async function writeAllExportArtifacts(
  input: Parameters<typeof writeHtmlArchiveExport>[0],
): Promise<ArchiveExportArtifactResult[]> {
  const html = await writeHtmlArchiveExport(input);
  const csv = await writeCsvArchiveExport(input);
  const json = await writeJsonArchiveExport(input);

  return [html, csv, json];
}

function mapArtifact(
  artifact: ArchiveExportArtifactResult,
): ExecuteExportResult["artifacts"][number] {
  return {
    format: artifact.format,
    filePath: artifact.filePath,
    conversationCount: artifact.conversationCount,
    messageCount: artifact.messageCount,
    attachmentCount: artifact.attachmentCount,
  };
}

function insertExportLog(
  exportJobId: number,
  level: "info" | "warn" | "error",
  message: string,
  metadata: Record<string, unknown>,
) {
  getSqlite()
    .prepare(
      `
      INSERT INTO task_logs (
        export_job_id, level, message, metadata_json, created_at
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    )
    .run(exportJobId, level, message, JSON.stringify(metadata), Date.now());
}
