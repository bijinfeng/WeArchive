import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { HStack, Stack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Token } from "@astryxdesign/core/Token";

import { sx, transferStyles } from "./styles";
import type {
  ImportCheckStatus,
  ImportSourceOption,
  ImportStep,
} from "./transferState";
import { IMPORT_SOURCE_OPTIONS } from "./transferState";

export interface ImportDraft {
  sourceId: ImportSourceOption["id"] | null;
  fileSelected: boolean;
  checkStatus: ImportCheckStatus;
  saveStrategy: "补充缺失内容" | "跳过已存在的记录" | "保留两份";
  attachmentStrategy: "全部导入附件" | "只导入图片和文件" | "暂不导入附件";
}

export interface ImportWorkbenchProps {
  draft: ImportDraft;
  activeStep: ImportStep;
  onDraftChange: (draft: ImportDraft) => void;
  onStepChange: (step: ImportStep) => void;
  onShowWarnings: () => void;
  onCreateImportTask: () => void;
}

export function ImportWorkbench({
  draft,
  activeStep,
  onDraftChange,
  onStepChange,
  onShowWarnings,
  onCreateImportTask,
}: ImportWorkbenchProps) {
  const selectedSource = IMPORT_SOURCE_OPTIONS.find(
    (source) => source.id === draft.sourceId,
  );

  return (
    <VStack gap={4} className={sx(transferStyles.panel)}>
      <VStack gap={1}>
        <Text weight="bold">{getImportTitle(activeStep)}</Text>
        <Text type="supporting" color="secondary">
          默认先检查文件，不会立刻写入当前归档。
        </Text>
      </VStack>

      {activeStep === 0 ? (
        <VStack gap={3}>
          <Stack className={sx(transferStyles.optionGrid)}>
            {IMPORT_SOURCE_OPTIONS.map((source) => (
              <Card
                key={source.id}
                padding={3}
                className={sx(transferStyles.optionCard)}
              >
                <VStack gap={2}>
                  <HStack gap={2} vAlign="center">
                    <Text weight="bold">{source.title}</Text>
                    {draft.sourceId === source.id ? (
                      <Token label="已选择" color="green" size="sm" />
                    ) : null}
                  </HStack>
                  <Text type="supporting" color="secondary">
                    {source.description}
                  </Text>
                  <Button
                    label={source.title}
                    variant={
                      draft.sourceId === source.id ? "primary" : "secondary"
                    }
                    size="sm"
                    onClick={() => {
                      onDraftChange({ ...draft, sourceId: source.id });
                    }}
                  />
                </VStack>
              </Card>
            ))}
          </Stack>
          <ImportPrimaryAction
            draft={draft}
            selectedSource={selectedSource}
            activeStep={activeStep}
            onDraftChange={onDraftChange}
            onStepChange={onStepChange}
            onCreateImportTask={onCreateImportTask}
          />
        </VStack>
      ) : null}

      {activeStep === 1 ? (
        <VStack gap={3}>
          <Card padding={3} className={sx(transferStyles.infoBox)}>
            <VStack gap={1}>
              <Text weight="bold">WeArchive-旧电脑备份.wearchive</Text>
              <Text type="supporting" color="secondary">
                820 MB · 2026-07-09 22:16 修改 · 可读取 · 预计检查 2 分钟
              </Text>
            </VStack>
          </Card>
          <ImportPrimaryAction
            draft={draft}
            selectedSource={selectedSource}
            activeStep={activeStep}
            onDraftChange={onDraftChange}
            onStepChange={onStepChange}
            onCreateImportTask={onCreateImportTask}
          />
        </VStack>
      ) : null}

      {activeStep === 2 ? (
        <VStack gap={3}>
          <ImportCheckPanel
            status={draft.checkStatus}
            onPause={() => onDraftChange({ ...draft, checkStatus: "paused" })}
            onResume={() => onDraftChange({ ...draft, checkStatus: "warning" })}
            onShowWarnings={onShowWarnings}
            onContinue={() => onStepChange(3)}
          />
        </VStack>
      ) : null}

      {activeStep === 3 ? (
        <VStack gap={3}>
          <Card padding={3} className={sx(transferStyles.infoBox)}>
            <VStack gap={2}>
              <Text weight="bold">保存到当前备份位置</Text>
              <Text type="supporting" color="secondary">
                账号匹配通过，默认保存到 Alice 的当前归档。
              </Text>
            </VStack>
          </Card>
          <HStack gap={2} className={sx(transferStyles.toolbar)}>
            <Button
              label="只补充缺失内容"
              variant={
                draft.saveStrategy === "补充缺失内容" ? "primary" : "secondary"
              }
              size="sm"
              onClick={() =>
                onDraftChange({ ...draft, saveStrategy: "补充缺失内容" })
              }
            />
            <Button
              label="全部导入附件"
              variant={
                draft.attachmentStrategy === "全部导入附件"
                  ? "primary"
                  : "secondary"
              }
              size="sm"
              onClick={() =>
                onDraftChange({ ...draft, attachmentStrategy: "全部导入附件" })
              }
            />
            <Button
              label="开始导入"
              variant="primary"
              size="sm"
              onClick={() => {
                onStepChange(4);
                onCreateImportTask();
              }}
            />
          </HStack>
        </VStack>
      ) : null}

      {activeStep === 4 ? (
        <VStack gap={3}>
          <Text weight="bold">导入完成</Text>
          <Text type="supporting" color="secondary">
            已导入 18 个会话、42,816 条消息、3,240 个附件。
          </Text>
          <HStack gap={2}>
            <Button label="查看导入的聊天记录" variant="primary" size="sm" />
            <Button label="导出导入报告" variant="secondary" size="sm" />
            <Button label="继续导入其他文件" variant="ghost" size="sm" />
          </HStack>
        </VStack>
      ) : null}
    </VStack>
  );
}

function ImportPrimaryAction({
  draft,
  selectedSource,
  activeStep,
  onDraftChange,
  onStepChange,
  onCreateImportTask,
}: {
  draft: ImportDraft;
  selectedSource: ImportSourceOption | undefined;
  activeStep: ImportStep;
  onDraftChange: (draft: ImportDraft) => void;
  onStepChange: (step: ImportStep) => void;
  onCreateImportTask: () => void;
}) {
  if (activeStep === 0) {
    return (
      <Button
        label={selectedSource?.actionLabel ?? "请选择来源"}
        variant="primary"
        size="sm"
        isDisabled={!selectedSource}
        {...(!selectedSource ? { tooltip: "请先选择导入来源" } : {})}
        onClick={() => {
          if (selectedSource) {
            onDraftChange({ ...draft, fileSelected: true });
            onStepChange(1);
          }
        }}
      />
    );
  }

  if (activeStep === 1) {
    return (
      <Button
        label={draft.fileSelected ? "开始检查文件" : "请选择文件"}
        variant="primary"
        size="sm"
        onClick={() => {
          onDraftChange({ ...draft, checkStatus: "checking" });
          onStepChange(2);
        }}
      />
    );
  }

  return (
    <Button
      label="开始导入"
      variant="primary"
      size="sm"
      onClick={() => {
        onStepChange(4);
        onCreateImportTask();
      }}
    />
  );
}

function ImportCheckPanel({
  status,
  onPause,
  onResume,
  onShowWarnings,
  onContinue,
}: {
  status: ImportCheckStatus;
  onPause: () => void;
  onResume: () => void;
  onShowWarnings: () => void;
  onContinue: () => void;
}) {
  if (status === "paused") {
    return (
      <VStack gap={3}>
        <Text weight="bold">已暂停，已读取的内容会保留</Text>
        <ProgressBar label="检查文件进度" value={48} hasValueLabel />
        <Button
          label="继续检查"
          variant="primary"
          size="sm"
          onClick={onResume}
        />
      </VStack>
    );
  }

  if (status === "warning") {
    return (
      <VStack gap={3}>
        <Text weight="bold">发现 6 个需要注意的问题</Text>
        <Text type="supporting" color="secondary">
          这些问题不会阻止导入，但可能影响部分附件或消息。
        </Text>
        <ProgressBar
          label="检查文件进度"
          value={100}
          hasValueLabel
          variant="warning"
        />
        <HStack gap={2}>
          <Button
            label="继续导入"
            variant="primary"
            size="sm"
            onClick={onContinue}
          />
          <Button
            label="查看警告"
            variant="secondary"
            size="sm"
            onClick={onShowWarnings}
          />
        </HStack>
      </VStack>
    );
  }

  return (
    <VStack gap={3}>
      <Text weight="bold">正在读取文件</Text>
      <Text type="supporting" color="secondary">
        正在识别账号、读取聊天记录，并检查图片、语音和文件是否完整。
      </Text>
      <ProgressBar label="检查文件进度" value={28} hasValueLabel />
      <HStack gap={2}>
        <Button
          label="暂停检查"
          variant="secondary"
          size="sm"
          onClick={onPause}
        />
        <Button label="查看详情" variant="secondary" size="sm" />
      </HStack>
    </VStack>
  );
}

function getImportTitle(step: ImportStep) {
  switch (step) {
    case 0:
      return "你要从哪里导入聊天记录？";
    case 1:
      return "请选择要导入的文件";
    case 2:
      return "检查文件";
    case 3:
      return "这些聊天记录要保存到哪里？";
    case 4:
      return "开始导入";
  }
}
