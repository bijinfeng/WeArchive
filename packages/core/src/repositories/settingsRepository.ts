import { getSqlite } from "../database";
import type { SettingWriteResult } from "../types";

export async function getSetting<T = unknown>(
  key: string,
  fallback: T | null = null,
): Promise<T | string | null> {
  const row = getSqlite()
    .prepare("SELECT value FROM settings WHERE key = ? LIMIT 1")
    .get(key) as { value: string } | undefined;

  return row?.value ?? fallback;
}

export async function setSetting(
  key: string,
  value: unknown,
): Promise<SettingWriteResult> {
  const previousRow = getSqlite()
    .prepare("SELECT value FROM settings WHERE key = ? LIMIT 1")
    .get(key) as { value: string } | undefined;
  const updatedAt = Date.now();

  getSqlite()
    .prepare(
      `
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `,
    )
    .run(key, serializeSettingValue(value), updatedAt);

  return {
    key,
    value,
    previousValue: previousRow?.value ?? null,
    rollbackValue: previousRow?.value ?? null,
    previousExists: previousRow !== undefined,
    updatedAt: new Date(updatedAt),
  };
}

export async function rollbackSetting(
  writeResult: SettingWriteResult,
): Promise<SettingWriteResult> {
  if (!writeResult.previousExists) {
    getSqlite()
      .prepare("DELETE FROM settings WHERE key = ?")
      .run(writeResult.key);

    return {
      key: writeResult.key,
      value: null,
      previousValue: serializeSettingValue(writeResult.value),
      rollbackValue: null,
      previousExists: true,
      updatedAt: new Date(),
    };
  }

  return setSetting(writeResult.key, writeResult.rollbackValue);
}

function serializeSettingValue(value: unknown): string {
  if (value === undefined) {
    return "null";
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value) ?? "null";
}
