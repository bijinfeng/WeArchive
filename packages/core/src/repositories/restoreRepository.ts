import { getSqlite } from "../database";
import type {
  RestoreExecutionResult,
  RestorePointSummary,
  RestoreStrategyInput,
  RestoreStrategyPreview,
  WeArchiveIssue,
} from "../types";

export const RESTORE_EXECUTION_DISABLED_REASON =
  "MVP 仅支持检查和预览恢复影响，覆盖当前数据将在恢复执行版本开放。";

interface RestorePointRow {
  id: number;
  archiveId: number | null;
  name: string;
  status: string;
  checkedAt: number | null;
  createdAt: number;
}

function mapRestorePoint(row: RestorePointRow): RestorePointSummary {
  return {
    id: row.id,
    archiveId: row.archiveId,
    name: row.name,
    status: row.status,
    checkedAt: row.checkedAt == null ? null : new Date(row.checkedAt),
    createdAt: new Date(row.createdAt),
  };
}

export async function listRestorePoints(): Promise<RestorePointSummary[]> {
  const rows = getSqlite()
    .prepare(
      `
      SELECT
        id,
        archive_id AS archiveId,
        name,
        status,
        checked_at AS checkedAt,
        created_at AS createdAt
      FROM restore_points
      ORDER BY created_at DESC, id DESC
    `,
    )
    .all() as RestorePointRow[];

  return rows.map(mapRestorePoint);
}

export async function checkRestorePoint(
  restorePointId: number,
): Promise<RestorePointSummary | null> {
  const row = getSqlite()
    .prepare(
      `
      SELECT
        id,
        archive_id AS archiveId,
        name,
        status,
        checked_at AS checkedAt,
        created_at AS createdAt
      FROM restore_points
      WHERE id = ?
      LIMIT 1
    `,
    )
    .get(restorePointId) as RestorePointRow | undefined;

  return row ? mapRestorePoint(row) : null;
}

export async function previewRestoreStrategy(
  input: RestoreStrategyInput,
): Promise<RestoreStrategyPreview> {
  const risks: WeArchiveIssue[] = [
    {
      id: `restore-${input.strategy}-disabled`,
      severity: input.strategy === "overwrite" ? "error" : "warning",
      title: "恢复执行暂未开放",
      description: RESTORE_EXECUTION_DISABLED_REASON,
      source: "restore",
    },
  ];

  return {
    strategy: input.strategy,
    disabledReason: RESTORE_EXECUTION_DISABLED_REASON,
    risks,
  };
}

export async function executeRestore(
  input: RestoreStrategyInput,
): Promise<RestoreExecutionResult> {
  const preview = await previewRestoreStrategy(input);

  return {
    ok: false,
    disabledReason: preview.disabledReason,
  };
}
