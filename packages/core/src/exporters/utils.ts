import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type {
  ArchiveExportArtifactInput,
  ArchiveExportArtifactResult,
  ArchiveExportFormat,
} from "./types";

export async function prepareExportPath(
  input: ArchiveExportArtifactInput,
  extension: ArchiveExportFormat,
) {
  await mkdir(input.targetDir, { recursive: true });
  return join(
    input.targetDir,
    `${sanitizeFileName(input.baseName)}.${extension}`,
  );
}

export function createExportResult(
  format: ArchiveExportFormat,
  filePath: string,
  input: ArchiveExportArtifactInput,
): ArchiveExportArtifactResult {
  return {
    format,
    filePath,
    conversationCount: input.conversations.length,
    messageCount: input.messages.length,
    attachmentCount: input.messages.filter((message) => message.type !== "text")
      .length,
  };
}

export function maskSensitiveText(value: string, enabled: boolean | undefined) {
  if (!enabled) {
    return value;
  }

  return value
    .replace(
      /1[3-9]\d{9}/g,
      (phone) => `${phone.slice(0, 3)}****${phone.slice(7)}`,
    )
    .replace(/wxid_[a-z0-9_]+/gi, "wxid_****");
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function sanitizeFileName(value: string) {
  return value.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "") || "export";
}
