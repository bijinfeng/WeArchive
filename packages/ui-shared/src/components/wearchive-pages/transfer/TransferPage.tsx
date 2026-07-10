import { Button } from "@astryxdesign/core/Button";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import type { BackupTask } from "@we-archive/core/types";
import { useMemo, useState } from "react";

import {
  type ExportDraft,
  type ExportTaskInput,
  ExportWorkbench,
  getSelectedConversations,
} from "./ExportWorkbench";
import { type ImportDraft, ImportWorkbench } from "./ImportWorkbench";
import { PreviewRiskPanel } from "./PreviewRiskPanel";
import { sx, transferStyles } from "./styles";
import { TransferModeSwitch } from "./TransferModeSwitch";
import { TransferStepper } from "./TransferStepper";
import { TransferTaskQueue } from "./TransferTaskQueue";
import type {
  ExportConversationOption,
  ExportStep,
  ImportStep,
  TransferMode,
  TransferQueueItem,
} from "./transferState";
import { EXPORT_STEPS, getTaskQueueItems, IMPORT_STEPS } from "./transferState";

export interface TransferPageProps {
  tasks: BackupTask[];
  query?: string;
  exportConversations?: ExportConversationOption[];
  onCreateImportTask?: () => void | Promise<void>;
  onCreateExportTask?: (input: ExportTaskInput) => void | Promise<void>;
}

const DEFAULT_IMPORT_DRAFT: ImportDraft = {
  sourceId: null,
  fileSelected: false,
  checkStatus: "idle",
  saveStrategy: "补充缺失内容",
  attachmentStrategy: "全部导入附件",
};

const DEFAULT_EXPORT_DRAFT: ExportDraft = {
  range: null,
  query: "",
  selectedConversationIds: [],
  format: "html",
  includeImages: true,
  includeVoice: true,
  includeFiles: true,
  includeVideo: false,
  maskSensitive: false,
  encryptExport: false,
  password: "",
  targetPath: null,
  pathChecked: false,
};

export function TransferPage({
  tasks,
  query = "",
  exportConversations,
  onCreateImportTask,
  onCreateExportTask,
}: TransferPageProps) {
  const [mode, setMode] = useState<TransferMode>("import");
  const [importStep, setImportStep] = useState<ImportStep>(0);
  const [exportStep, setExportStep] = useState<ExportStep>(0);
  const [importDraft, setImportDraft] = useState(DEFAULT_IMPORT_DRAFT);
  const [exportDraft, setExportDraft] = useState(DEFAULT_EXPORT_DRAFT);
  const [showImportWarnings, setShowImportWarnings] = useState(false);
  const [localQueue, setLocalQueue] = useState<TransferQueueItem[]>([]);

  const externalQueue = useMemo(() => getTaskQueueItems(tasks), [tasks]);
  const queueItems = [...localQueue, ...externalQueue];
  const conversationOptions = exportConversations;
  const selectedExportConversations = getSelectedConversations(
    exportDraft.selectedConversationIds,
    conversationOptions,
  );

  const createImportTask = () => {
    const item: TransferQueueItem = {
      id: `local-import-${Date.now()}`,
      type: "import",
      name: "旧电脑本地备份导入",
      stage: "正在保存聊天记录",
      progress: 36,
      status: "running",
      remainingTime: "2 分钟",
    };

    setLocalQueue((current) => [item, ...current]);
    void onCreateImportTask?.();
  };

  const createExportTask = (input: ExportTaskInput) => {
    const item: TransferQueueItem = {
      id: `local-export-${Date.now()}`,
      type: "export",
      name: "客户会话 HTML 归档",
      stage: "正在收集聊天记录",
      progress: 18,
      status: "running",
      remainingTime: "4 分钟",
    };

    setLocalQueue((current) => [item, ...current]);
    void onCreateExportTask?.(input);
  };

  return (
    <VStack gap={5} className={sx(transferStyles.page)}>
      <HStack gap={3} vAlign="center" className={sx(transferStyles.header)}>
        <VStack gap={1} className={sx(transferStyles.title)}>
          <Text weight="bold">导入导出</Text>
          <Text type="supporting" color="secondary">
            从外部导入聊天记录，或将当前记录导出成文件。
          </Text>
        </VStack>
        <TransferModeSwitch mode={mode} onModeChange={setMode} />
      </HStack>

      {query.trim() ? (
        <VStack className={sx(transferStyles.infoBox)}>
          <Text type="supporting" color="secondary">
            当前页正在筛选「{query}」。
          </Text>
        </VStack>
      ) : null}

      <section className={sx(transferStyles.frame)} aria-label="导入导出工作台">
        <TransferStepper
          steps={mode === "import" ? IMPORT_STEPS : EXPORT_STEPS}
          activeStep={mode === "import" ? importStep : exportStep}
          {...(mode === "import" && importDraft.checkStatus === "warning"
            ? { warningStep: 2 }
            : {})}
        />

        {mode === "import" ? (
          <ImportWorkbench
            draft={importDraft}
            activeStep={importStep}
            onDraftChange={setImportDraft}
            onStepChange={setImportStep}
            onShowWarnings={() => setShowImportWarnings(true)}
            onCreateImportTask={createImportTask}
          />
        ) : (
          <ExportWorkbench
            draft={exportDraft}
            activeStep={exportStep}
            {...(conversationOptions
              ? { conversations: conversationOptions }
              : {})}
            onDraftChange={setExportDraft}
            onStepChange={setExportStep}
            onCreateExportTask={createExportTask}
          />
        )}

        <PreviewRiskPanel
          mode={mode}
          selectedExportConversations={selectedExportConversations}
          importWarningVisible={showImportWarnings}
          maskSensitive={exportDraft.maskSensitive}
        />
      </section>

      <TransferTaskQueue
        items={queueItems}
        onUpdateItem={(itemId, status) => {
          setLocalQueue((current) =>
            current.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    status,
                    stage:
                      status === "paused"
                        ? "已暂停，已完成部分会保留"
                        : item.stage,
                  }
                : item,
            ),
          );
        }}
      />

      {queueItems.length === 0 ? (
        <HStack gap={2} className={sx(transferStyles.actions)}>
          <Button
            label={mode === "import" ? "开始新的导入" : "开始新的导出"}
            variant="ghost"
            size="sm"
            onClick={() => {
              if (mode === "import") {
                setImportStep(0);
              } else {
                setExportStep(0);
              }
            }}
          />
        </HStack>
      ) : null}
    </VStack>
  );
}
