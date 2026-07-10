import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Conversation } from "@we-archive/core/types";

import {
  getApiAdapter,
  useBackupTasks,
  useConversationList,
} from "../../../hooks";
import type { ExportTaskInput } from "./ExportWorkbench";
import { TransferPage } from "./TransferPage";
import type { ExportConversationOption } from "./transferState";

export interface TransferPageControllerProps {
  query?: string;
}

export function TransferPageController({ query }: TransferPageControllerProps) {
  const queryClient = useQueryClient();
  const tasksQuery = useBackupTasks();
  const conversationsQuery = useConversationList({
    limit: 20,
    offset: 0,
  });
  const createImportMutation = useMutation({
    mutationFn: () =>
      getApiAdapter()
        .transfer.executeImport({
          sourcePath: "/Users/local/Downloads/WeArchive-旧电脑备份.wearchive",
        })
        .then(() =>
          getApiAdapter().tasks.create({
            currentStep: "导入任务：正在保存聊天记录",
          }),
        ),
    onSettled: () => {
      invalidateTransferQueries(queryClient);
    },
  });
  const createExportMutation = useMutation({
    mutationFn: (input: ExportTaskInput) =>
      getApiAdapter()
        .transfer.executeExport({
          conversationIds: input.conversationIds,
          format: input.format,
          targetDir: resolveWritableExportPath(input.targetPath),
          baseName: "客户会话 HTML 归档",
          maskSensitive: input.maskSensitive,
        })
        .then((result) =>
          getApiAdapter().tasks.create({
            currentStep: `导出任务：已生成 ${result.artifacts.length} 个文件`,
            savePath: result.artifacts[0]?.filePath ?? input.targetPath,
          }),
        ),
    onSettled: () => {
      invalidateTransferQueries(queryClient);
    },
  });
  const exportConversations = mapExportConversations(
    conversationsQuery.data?.items,
  );

  return (
    <TransferPage
      tasks={tasksQuery.data ?? []}
      query={query ?? ""}
      {...(exportConversations ? { exportConversations } : {})}
      onCreateImportTask={() =>
        createImportMutation.mutateAsync().then(() => undefined)
      }
      onCreateExportTask={(input) =>
        createExportMutation.mutateAsync(input).then(() => undefined)
      }
    />
  );
}

function mapExportConversations(
  conversations: Conversation[] | undefined,
): ExportConversationOption[] | undefined {
  if (!Array.isArray(conversations) || conversations.length === 0) {
    return undefined;
  }

  return conversations.map((conversation) => ({
    id: String(conversation.id),
    name: conversation.name,
    description: conversation.lastMessagePreview,
    messageCount: conversation.messageCount,
    attachmentCount: conversation.hasAttachments ? 1 : 0,
  }));
}

function resolveWritableExportPath(targetPath: string) {
  if (targetPath.startsWith("/Users/local/")) {
    return "/tmp/wearchive-exports";
  }

  return targetPath;
}

function invalidateTransferQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: ["backupTasks"] });
  queryClient.invalidateQueries({ queryKey: ["overview"] });
  queryClient.invalidateQueries({ queryKey: ["conversations"] });
  queryClient.invalidateQueries({ queryKey: ["conversationDetail"] });
  queryClient.invalidateQueries({ queryKey: ["messages"] });
}
