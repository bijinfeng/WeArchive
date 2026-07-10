import { writeFile } from "node:fs/promises";
import type {
  ArchiveExportArtifactInput,
  ArchiveExportArtifactResult,
} from "./types";
import {
  createExportResult,
  escapeHtml,
  maskSensitiveText,
  prepareExportPath,
} from "./utils";

export async function writeHtmlArchiveExport(
  input: ArchiveExportArtifactInput,
): Promise<ArchiveExportArtifactResult> {
  const filePath = await prepareExportPath(input, "html");
  const conversations = new Map(
    input.conversations.map((conversation) => [conversation.id, conversation]),
  );
  const rows = input.messages
    .map((message) => {
      const conversation = conversations.get(message.conversationId);
      const content = maskSensitiveText(message.content, input.maskSensitive);

      return `<article class="message">
  <header>${escapeHtml(conversation?.name ?? message.conversationId)} · ${escapeHtml(message.senderName)} · ${escapeHtml(message.timestamp.toISOString())}</header>
  <p>${escapeHtml(content)}</p>
</article>`;
    })
    .join("\n");
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>WeArchive HTML 归档</title>
</head>
<body>
  <h1>WeArchive HTML 归档</h1>
  <p>会话 ${input.conversations.length} 个，消息 ${input.messages.length} 条。</p>
  ${rows}
</body>
</html>
`;

  await writeFile(filePath, html, "utf8");
  return createExportResult("html", filePath, input);
}
