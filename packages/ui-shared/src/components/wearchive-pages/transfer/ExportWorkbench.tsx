import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { CheckboxInput } from "@astryxdesign/core/CheckboxInput";
import { HStack, Stack, VStack } from "@astryxdesign/core/Stack";
import { Switch } from "@astryxdesign/core/Switch";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Token } from "@astryxdesign/core/Token";

import { sx, transferStyles } from "./styles";
import type { ExportConversationOption, ExportStep } from "./transferState";
import { EXPORT_CONVERSATIONS } from "./transferState";

export interface ExportDraft {
  range: "all" | "conversation" | null;
  query: string;
  selectedConversationIds: string[];
  format: "html" | "csv" | "json" | null;
  includeImages: boolean;
  includeVoice: boolean;
  includeFiles: boolean;
  includeVideo: boolean;
  maskSensitive: boolean;
  encryptExport: boolean;
  password: string;
  targetPath: string | null;
  pathChecked: boolean;
}

export interface ExportTaskInput {
  conversationIds: string[];
  format: "html" | "csv" | "json";
  targetPath: string;
  maskSensitive: boolean;
  encrypted?: boolean;
  password?: string;
}

export interface ExportWorkbenchProps {
  draft: ExportDraft;
  activeStep: ExportStep;
  conversations?: ExportConversationOption[];
  onDraftChange: (draft: ExportDraft) => void;
  onStepChange: (step: ExportStep) => void;
  onCreateExportTask: (input: ExportTaskInput) => void;
}

export function ExportWorkbench({
  draft,
  activeStep,
  conversations = EXPORT_CONVERSATIONS,
  onDraftChange,
  onStepChange,
  onCreateExportTask,
}: ExportWorkbenchProps) {
  const selectedConversations = getSelectedConversations(
    draft.selectedConversationIds,
    conversations,
  );
  const passwordStatus = getPasswordStatus(draft.password);
  const passwordInvalid = isPasswordInvalid(draft);

  return (
    <VStack gap={4} className={sx(transferStyles.panel)}>
      <VStack gap={1}>
        <Text weight="bold">{getExportTitle(activeStep)}</Text>
        <Text type="supporting" color="secondary">
          先选范围，再选格式、内容和保存位置。
        </Text>
      </VStack>

      {activeStep === 0 ? (
        <VStack gap={3}>
          <Stack className={sx(transferStyles.optionGrid)}>
            <Button
              label="全部聊天记录"
              variant={draft.range === "all" ? "primary" : "secondary"}
              size="md"
              onClick={() => onDraftChange({ ...draft, range: "all" })}
            />
            <Button
              label="指定会话"
              variant={draft.range === "conversation" ? "primary" : "secondary"}
              size="md"
              onClick={() => onDraftChange({ ...draft, range: "conversation" })}
            />
          </Stack>
          {draft.range === "conversation" ? (
            <ConversationSelector
              draft={draft}
              conversations={conversations}
              onDraftChange={onDraftChange}
            />
          ) : null}
          <HStack gap={2} className={sx(transferStyles.toolbar)}>
            <Text type="supporting" color="secondary">
              已选 {draft.selectedConversationIds.length} 个会话
            </Text>
            <Button
              label={draft.range ? "下一步，选择导出格式" : "请选择导出范围"}
              variant="primary"
              size="sm"
              isDisabled={!draft.range}
              onClick={() => onStepChange(1)}
            />
          </HStack>
        </VStack>
      ) : null}

      {activeStep === 1 ? (
        <VStack gap={3}>
          <FormatGrid draft={draft} onDraftChange={onDraftChange} />
          <Button
            label="下一步，设置导出内容"
            variant="primary"
            size="sm"
            isDisabled={!draft.format}
            onClick={() => onStepChange(2)}
          />
        </VStack>
      ) : null}

      {activeStep === 2 ? (
        <VStack gap={3}>
          <Stack className={sx(transferStyles.checkboxGrid)}>
            <Switch
              label="包含图片"
              value={draft.includeImages}
              onChange={(value) =>
                onDraftChange({ ...draft, includeImages: value })
              }
            />
            <Switch
              label="包含语音"
              value={draft.includeVoice}
              onChange={(value) =>
                onDraftChange({ ...draft, includeVoice: value })
              }
            />
            <Switch
              label="包含文件"
              value={draft.includeFiles}
              onChange={(value) =>
                onDraftChange({ ...draft, includeFiles: value })
              }
            />
            <Switch
              label="包含视频"
              value={draft.includeVideo}
              onChange={(value) =>
                onDraftChange({ ...draft, includeVideo: value })
              }
            />
            <Switch
              label="隐藏手机号和微信号"
              value={draft.maskSensitive}
              onChange={(value) =>
                onDraftChange({ ...draft, maskSensitive: value })
              }
            />
            <Switch
              label="加密导出文件"
              value={draft.encryptExport}
              onChange={(value) =>
                onDraftChange({
                  ...draft,
                  encryptExport: value,
                  password: value ? draft.password : "",
                })
              }
            />
          </Stack>
          {draft.encryptExport ? (
            <TextInput
              label="导出密码"
              type="password"
              size="sm"
              value={draft.password}
              description="用于打开导出文件，至少 8 位。"
              {...(passwordStatus ? { status: passwordStatus } : {})}
              onChange={(password) => onDraftChange({ ...draft, password })}
            />
          ) : null}
          <Button
            label="下一步，选择保存位置"
            variant="primary"
            size="sm"
            isDisabled={passwordInvalid}
            {...(passwordInvalid
              ? { tooltip: "请先输入至少 8 位导出密码" }
              : {})}
            onClick={() => {
              if (passwordInvalid) {
                return;
              }

              onStepChange(3);
            }}
          />
        </VStack>
      ) : null}

      {activeStep === 3 ? (
        <VStack gap={3}>
          <Card
            padding={3}
            className={sx(
              transferStyles.infoBox,
              draft.pathChecked && transferStyles.successBox,
            )}
          >
            <VStack gap={1}>
              <Text weight="bold">
                {draft.targetPath ?? "导出的文件要保存到哪里？"}
              </Text>
              <Text type="supporting" color="secondary">
                {draft.pathChecked
                  ? "可以保存"
                  : "选择保存位置后会检查写入权限、空间和同名文件。"}
              </Text>
            </VStack>
          </Card>
          <HStack gap={2}>
            <Button
              label="选择保存位置"
              variant="secondary"
              size="sm"
              onClick={() =>
                onDraftChange({
                  ...draft,
                  targetPath: "/Users/local/Documents/WeArchive/exports",
                  pathChecked: true,
                })
              }
            />
            <Button
              label="开始导出"
              variant="primary"
              size="sm"
              isDisabled={!draft.pathChecked || !draft.format}
              onClick={() => {
                if (!draft.format || !draft.targetPath) {
                  return;
                }

                onStepChange(4);
                onCreateExportTask({
                  conversationIds:
                    draft.selectedConversationIds.length > 0
                      ? draft.selectedConversationIds
                      : conversations.map((conversation) => conversation.id),
                  format: draft.format,
                  targetPath: draft.targetPath,
                  maskSensitive: draft.maskSensitive,
                  ...(draft.encryptExport
                    ? {
                        encrypted: true,
                        password: draft.password,
                      }
                    : {}),
                });
              }}
            />
          </HStack>
        </VStack>
      ) : null}

      {activeStep === 4 ? (
        <VStack gap={3}>
          <Text weight="bold">导出完成</Text>
          <Text type="supporting" color="secondary">
            已导出 {selectedConversations.length}{" "}
            个会话，可打开文件夹或查看报告。
          </Text>
          <HStack gap={2}>
            <Button label="打开文件夹" variant="primary" size="sm" />
            <Button label="查看导出报告" variant="secondary" size="sm" />
            <Button label="继续导出其他内容" variant="ghost" size="sm" />
          </HStack>
        </VStack>
      ) : null}
    </VStack>
  );
}

export function getSelectedConversations(
  ids: string[],
  conversations = EXPORT_CONVERSATIONS,
) {
  if (ids.length === 0) {
    return [];
  }

  return conversations.filter((conversation) => ids.includes(conversation.id));
}

function ConversationSelector({
  draft,
  conversations,
  onDraftChange,
}: {
  draft: ExportDraft;
  conversations: ExportConversationOption[];
  onDraftChange: (draft: ExportDraft) => void;
}) {
  const normalizedQuery = draft.query.trim().toLowerCase();
  const filteredConversations = normalizedQuery
    ? conversations.filter((conversation) =>
        `${conversation.name} ${conversation.description}`
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : conversations;

  return (
    <VStack gap={3}>
      <TextInput
        label="搜索会话"
        size="sm"
        value={draft.query}
        onChange={(query) => onDraftChange({ ...draft, query })}
        placeholder="搜索联系人、群聊或客户"
        hasClear
      />
      <VStack gap={2}>
        {filteredConversations.map((conversation) => (
          <CheckboxInput
            key={conversation.id}
            label={conversation.name}
            description={conversation.description}
            value={draft.selectedConversationIds.includes(conversation.id)}
            onChange={(checked) => {
              onDraftChange({
                ...draft,
                selectedConversationIds: checked
                  ? [...draft.selectedConversationIds, conversation.id]
                  : draft.selectedConversationIds.filter(
                      (id) => id !== conversation.id,
                    ),
              });
            }}
          />
        ))}
      </VStack>
    </VStack>
  );
}

function FormatGrid({
  draft,
  onDraftChange,
}: {
  draft: ExportDraft;
  onDraftChange: (draft: ExportDraft) => void;
}) {
  return (
    <Stack className={sx(transferStyles.optionGrid)}>
      <FormatButton
        label="HTML 归档"
        description="可以像网页一样打开查看，保留聊天结构"
        selected={draft.format === "html"}
        onClick={() => onDraftChange({ ...draft, format: "html" })}
      />
      <FormatButton
        label="CSV"
        description="表格格式，只包含文本和基础字段"
        selected={draft.format === "csv"}
        onClick={() => onDraftChange({ ...draft, format: "csv" })}
      />
      <FormatButton
        label="JSON"
        description="结构化数据，适合技术迁移或二次处理"
        selected={draft.format === "json"}
        onClick={() => onDraftChange({ ...draft, format: "json" })}
      />
    </Stack>
  );
}

function FormatButton({
  label,
  description,
  selected,
  onClick,
}: {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Card padding={3} className={sx(transferStyles.infoBox)}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Text weight="bold">{label}</Text>
          {selected ? <Token label="已选择" color="green" size="sm" /> : null}
        </HStack>
        <Text type="supporting" color="secondary">
          {description}
        </Text>
        <Button
          label={label}
          variant={selected ? "primary" : "secondary"}
          size="sm"
          onClick={onClick}
        />
      </VStack>
    </Card>
  );
}

function getExportTitle(step: ExportStep) {
  switch (step) {
    case 0:
      return "你要导出哪些聊天记录？";
    case 1:
      return "你想导出成什么格式？";
    case 2:
      return "设置导出内容";
    case 3:
      return "导出的文件要保存到哪里？";
    case 4:
      return "开始导出";
  }
}

function isPasswordInvalid(draft: ExportDraft) {
  return draft.encryptExport && draft.password.length < 8;
}

function getPasswordStatus(password: string) {
  if (password.length === 0) {
    return null;
  }

  if (password.length < 8) {
    return {
      type: "error" as const,
      message: "密码至少 8 位",
    };
  }

  return {
    type: "success" as const,
    message: "密码可用",
  };
}
