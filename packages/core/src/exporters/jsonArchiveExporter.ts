import { writeFile } from "node:fs/promises";
import type {
  ArchiveExportArtifactInput,
  ArchiveExportArtifactResult,
} from "./types";
import {
  createExportResult,
  maskSensitiveText,
  prepareExportPath,
} from "./utils";

export async function writeJsonArchiveExport(
  input: ArchiveExportArtifactInput,
): Promise<ArchiveExportArtifactResult> {
  const filePath = await prepareExportPath(input, "json");
  const payload = {
    schema: "wearchive.export.v0",
    summary: {
      conversationCount: input.conversations.length,
      messageCount: input.messages.length,
    },
    conversations: input.conversations,
    messages: input.messages.map((message) => ({
      ...message,
      content: maskSensitiveText(message.content, input.maskSensitive),
      timestamp: message.timestamp.toISOString(),
    })),
  };

  await writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
  return createExportResult("json", filePath, input);
}
