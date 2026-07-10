import { getSqlite } from "../database";
import type {
  WeArchiveArchiveStatus,
  WeArchiveHomeData,
  WeArchiveIssue,
  WeArchiveOverviewAccount,
  WeArchiveOverviewStats,
  WeArchiveOverviewTask,
} from "../types";

interface AccountRow {
  id: number;
  wxid: string;
  nickname: string | null;
  avatar: string | null;
  lastBackupAt: number | null;
}

interface ArchiveRow {
  id: number;
  name: string;
  sourceType: string;
  importedAt: number | null;
}

interface TaskRow {
  id: number;
  status: string;
  progress: number | null;
  currentStep: string | null;
  savePath: string | null;
}

function readCount(sql: string, params: unknown[] = []): number {
  const row = getSqlite()
    .prepare(sql)
    .get(...params) as { total: number };
  return row.total;
}

function readStorageSize(): number {
  const row = getSqlite()
    .prepare("SELECT COALESCE(SUM(file_size), 0) AS total FROM attachments")
    .get() as { total: number };

  return row.total;
}

function mapAccount(
  row: AccountRow | undefined,
): WeArchiveOverviewAccount | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    wxid: row.wxid,
    nickname: row.nickname ?? row.wxid,
    avatar: row.avatar,
    lastBackupAt: row.lastBackupAt == null ? null : new Date(row.lastBackupAt),
  };
}

function mapTask(row: TaskRow): WeArchiveOverviewTask {
  return {
    id: row.id,
    status: row.status,
    progress: row.progress,
    currentStep: row.currentStep,
    savePath: row.savePath,
  };
}

function buildIssues(): WeArchiveIssue[] {
  const partialAttachments = readCount(
    "SELECT COUNT(*) AS total FROM attachments WHERE backup_status = 'partial'",
  );
  const unknownMessages = readCount(
    "SELECT COUNT(*) AS total FROM messages WHERE type = 'unknown'",
  );
  const issues: WeArchiveIssue[] = [];

  if (partialAttachments > 0) {
    issues.push({
      id: "partial-attachments",
      severity: "warning",
      title: "附件未完整备份",
      description: `${partialAttachments} 个附件只有占位信息，可在导入导出页查看详情。`,
      source: "attachment",
    });
  }

  if (unknownMessages > 0) {
    issues.push({
      id: "unknown-messages",
      severity: "warning",
      title: "存在未知消息类型",
      description: `${unknownMessages} 条消息将以原始占位内容展示。`,
      source: "message",
    });
  }

  return issues;
}

function buildArchiveStatus(issues: WeArchiveIssue[]): WeArchiveArchiveStatus {
  const archive = getSqlite()
    .prepare(
      `
      SELECT
        id,
        name,
        source_type AS sourceType,
        imported_at AS importedAt
      FROM archives
      ORDER BY imported_at DESC, created_at DESC
      LIMIT 1
    `,
    )
    .get() as ArchiveRow | undefined;

  if (!archive) {
    return {
      id: null,
      name: "暂无归档",
      health: "empty",
      importedAt: null,
    };
  }

  return {
    id: archive.id,
    name: archive.name,
    health: issues.length > 0 ? "attention" : "ready",
    sourceType: archive.sourceType,
    importedAt:
      archive.importedAt == null ? null : new Date(archive.importedAt),
  };
}

export async function getOverviewData(): Promise<WeArchiveHomeData> {
  const sqlite = getSqlite();
  const account = mapAccount(
    sqlite
      .prepare(
        `
        SELECT
          id,
          wxid,
          nickname,
          avatar,
          last_backup_at AS lastBackupAt
        FROM accounts
        ORDER BY last_backup_at DESC, created_at ASC
        LIMIT 1
      `,
      )
      .get() as AccountRow | undefined,
  );
  const issues = buildIssues();
  const stats: WeArchiveOverviewStats = {
    conversationCount: readCount("SELECT COUNT(*) AS total FROM conversations"),
    messageCount: readCount("SELECT COUNT(*) AS total FROM messages"),
    attachmentCount: readCount("SELECT COUNT(*) AS total FROM attachments"),
    storageSize: readStorageSize(),
    todayNewCount: readCount(
      "SELECT COUNT(*) AS total FROM messages WHERE timestamp >= ?",
      [new Date().setHours(0, 0, 0, 0)],
    ),
    pendingIssues: issues.length,
  };
  const tasks = sqlite
    .prepare(
      `
      SELECT
        id,
        status,
        progress,
        current_step AS currentStep,
        save_path AS savePath
      FROM backup_tasks
      ORDER BY started_at DESC
      LIMIT 5
    `,
    )
    .all() as TaskRow[];

  return {
    account,
    stats,
    tasks: tasks.map(mapTask),
    issues,
    archiveStatus: buildArchiveStatus(issues),
  };
}
