import { importNormalizedArchive, weArchiveFixture } from "../archive";
import { getSqlite } from "../database";

export interface ArchiveSummary {
  id: number;
  archiveId: string;
  name: string;
  sourceType: string;
  sourceVersion: string | null;
  importedAt: Date | null;
  createdAt: Date;
}

export interface ArchiveEntityCounts {
  accounts: number;
  contacts: number;
  conversations: number;
  messages: number;
  attachments: number;
  importJobs: number;
  exportJobs: number;
  taskLogs: number;
  restorePoints: number;
}

interface ArchiveSummaryRow {
  id: number;
  archiveId: string;
  name: string;
  sourceType: string;
  sourceVersion: string | null;
  importedAt: number | null;
  createdAt: number;
}

function readCount(tableName: string): number {
  const sqlite = getSqlite();
  const row = sqlite
    .prepare(`SELECT COUNT(*) AS total FROM ${tableName}`)
    .get() as { total: number };

  return row.total;
}

export function listArchives(): ArchiveSummary[] {
  const sqlite = getSqlite();
  const rows = sqlite
    .prepare(
      `
      SELECT
        id,
        archive_id AS archiveId,
        name,
        source_type AS sourceType,
        source_version AS sourceVersion,
        imported_at AS importedAt,
        created_at AS createdAt
      FROM archives
      ORDER BY imported_at DESC, created_at DESC
    `,
    )
    .all() as ArchiveSummaryRow[];

  return rows.map((row) => ({
    ...row,
    importedAt: row.importedAt == null ? null : new Date(row.importedAt),
    createdAt: new Date(row.createdAt),
  }));
}

export function getArchiveEntityCounts(): ArchiveEntityCounts {
  return {
    accounts: readCount("accounts"),
    contacts: readCount("contacts"),
    conversations: readCount("conversations"),
    messages: readCount("messages"),
    attachments: readCount("attachments"),
    importJobs: readCount("import_jobs"),
    exportJobs: readCount("export_jobs"),
    taskLogs: readCount("task_logs"),
    restorePoints: readCount("restore_points"),
  };
}

export async function seedFixtureArchiveIfEmpty(): Promise<boolean> {
  const archiveCount = readCount("archives");

  if (archiveCount > 0) {
    return false;
  }

  await importNormalizedArchive(weArchiveFixture);
  return true;
}
