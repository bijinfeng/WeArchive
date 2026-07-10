import { writeFile } from "node:fs/promises";
import type {
  ArchiveExportArtifactInput,
  ArchiveExportArtifactResult,
} from "./types";
import {
  createExportResult,
  escapeCsv,
  maskSensitiveText,
  prepareExportPath,
} from "./utils";

export async function writeCsvArchiveExport(
  input: ArchiveExportArtifactInput,
): Promise<ArchiveExportArtifactResult> {
  const filePath = await prepareExportPath(input, "csv");
  const conversations = new Map(
    input.conversations.map((conversation) => [conversation.id, conversation]),
  );
  const rows = input.messages.map((message) =>
    [
      conversations.get(message.conversationId)?.name ?? message.conversationId,
      message.senderName,
      message.type,
      message.timestamp.toISOString(),
      maskSensitiveText(message.content, input.maskSensitive),
    ]
      .map(escapeCsv)
      .join(","),
  );

  await writeFile(
    filePath,
    ["conversation,sender,type,timestamp,content", ...rows].join("\n"),
    "utf8",
  );
  return createExportResult("csv", filePath, input);
}
