import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Token } from "@astryxdesign/core/Token";
import { formatFileSize, formatNumber } from "@we-archive/core/utils";

import { sx, transferStyles } from "./styles";
import type { ExportConversationOption, TransferMode } from "./transferState";

export interface PreviewRiskPanelProps {
  mode: TransferMode;
  selectedExportConversations: ExportConversationOption[];
  importWarningVisible: boolean;
  maskSensitive: boolean;
}

export function PreviewRiskPanel({
  mode,
  selectedExportConversations,
  importWarningVisible,
  maskSensitive,
}: PreviewRiskPanelProps) {
  return (
    <VStack
      gap={4}
      className={sx(transferStyles.panel, transferStyles.previewPanel)}
      role="region"
      aria-label="预览与风险"
    >
      <HStack gap={2} vAlign="center">
        <Text weight="bold">预览与风险</Text>
        <Token
          label={mode === "import" ? "导入预览" : "导出预览"}
          color={mode === "import" ? "green" : "blue"}
          size="sm"
        />
      </HStack>

      {mode === "import" ? (
        <ImportPreview importWarningVisible={importWarningVisible} />
      ) : (
        <ExportPreview
          conversations={selectedExportConversations}
          maskSensitive={maskSensitive}
        />
      )}
    </VStack>
  );
}

function ImportPreview({
  importWarningVisible,
}: {
  importWarningVisible: boolean;
}) {
  return (
    <VStack gap={3}>
      <Metric label="账号" value="2" />
      <Metric label="会话" value="18" />
      <Metric label="消息" value={formatNumber(42816)} />
      <Metric label="附件" value={formatNumber(3240)} />
      <Metric label="预计占用" value={formatFileSize(1024 * 1024 * 820)} />
      <Card padding={3} className={sx(transferStyles.infoBox)}>
        <Text type="supporting" color="secondary">
          选择本地备份文件后会先检查内容，不会立刻修改当前归档。
        </Text>
      </Card>
      {importWarningVisible ? (
        <Card
          padding={3}
          className={sx(transferStyles.infoBox, transferStyles.warningBox)}
        >
          <VStack gap={1}>
            <Text weight="bold">6 个附件路径需要重新定位</Text>
            <Text type="supporting" color="secondary">
              这些问题不会阻止导入，但可能影响部分附件或消息。
            </Text>
          </VStack>
        </Card>
      ) : null}
    </VStack>
  );
}

function ExportPreview({
  conversations,
  maskSensitive,
}: {
  conversations: ExportConversationOption[];
  maskSensitive: boolean;
}) {
  const messageCount = conversations.reduce(
    (total, conversation) => total + conversation.messageCount,
    0,
  );
  const attachmentCount = conversations.reduce(
    (total, conversation) => total + conversation.attachmentCount,
    0,
  );

  return (
    <VStack gap={3}>
      <Metric label="会话" value={`${conversations.length}`} />
      <Metric label="消息" value={formatNumber(messageCount)} />
      <Metric label="附件" value={formatNumber(attachmentCount)} />
      <Metric
        label="预计大小"
        value={formatFileSize((messageCount + attachmentCount * 8) * 1024)}
      />
      <Card padding={3} className={sx(transferStyles.infoBox)}>
        <VStack gap={2}>
          <Text weight="bold">HTML 归档预览</Text>
          <Text type="supporting" color="secondary">
            {maskSensitive
              ? "客户张敏 · 138****5678 · wxid_****_client"
              : "客户张敏 · 13800005678 · wxid_customer_client"}
          </Text>
          {maskSensitive ? <Text>138****5678</Text> : null}
        </VStack>
      </Card>
      <Card
        padding={3}
        className={sx(transferStyles.infoBox, transferStyles.successBox)}
      >
        <Text type="supporting" color="secondary">
          右侧预估会随范围、格式、媒体和脱敏设置实时更新。
        </Text>
      </Card>
    </VStack>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <HStack gap={3} vAlign="center" className={sx(transferStyles.infoBox)}>
      <Text type="supporting" color="secondary">
        {label}
      </Text>
      <Text weight="bold">{value}</Text>
    </HStack>
  );
}
