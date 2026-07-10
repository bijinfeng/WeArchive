import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Token } from "@astryxdesign/core/Token";
import type {
  Conversation,
  ConversationDetail,
  WeArchiveViewId,
} from "@we-archive/core/types";
import { formatNumber } from "@we-archive/core/utils";
import { formatDate } from "date-fns";

import type { RecordsNavigationIntent } from "./recordsModel";
import {
  getBackupStatusLabel,
  getBackupStatusTone,
  getConversationTypeLabel,
} from "./recordsModel";
import { recordsStyles, sx } from "./styles";

export interface ConversationDetailPanelProps {
  conversation: Conversation | null;
  detail: ConversationDetail | null;
  onNavigate?:
    | ((viewId: WeArchiveViewId, intent?: RecordsNavigationIntent) => void)
    | undefined;
}

export function ConversationDetailPanel({
  conversation,
  detail,
  onNavigate,
}: ConversationDetailPanelProps) {
  if (!conversation) {
    return (
      <section aria-label="会话详情" className={sx(recordsStyles.detailPane)}>
        <VStack gap={2} className={sx(recordsStyles.empty)}>
          <Text weight="bold">未选择会话</Text>
          <Text type="supporting" color="secondary">
            从左侧选择一个会话后查看详情。
          </Text>
        </VStack>
      </section>
    );
  }

  const risks = detail?.risks ?? [];

  return (
    <section aria-label="会话详情" className={sx(recordsStyles.detailPane)}>
      <VStack gap={4}>
        <VStack gap={2}>
          <Text weight="bold">{conversation.name}</Text>
          <Text type="supporting" color="secondary">
            {getConversationTypeLabel(conversation.type)} ·{" "}
            {formatNumber(conversation.messageCount)} 条消息
          </Text>
          <Token
            label={getBackupStatusLabel(conversation.backupStatus)}
            color={getBackupStatusTone(conversation.backupStatus)}
            size="sm"
          />
        </VStack>

        <Card padding={3}>
          <VStack gap={2} className={sx(recordsStyles.kvGrid)}>
            <KeyValue label="会话名称" value={conversation.name} />
            <KeyValue label="成员数量" value={`${conversation.memberCount}`} />
            <KeyValue
              label="消息数量"
              value={formatNumber(conversation.messageCount)}
            />
            <KeyValue
              label="附件总大小"
              value={conversation.hasAttachments ? "有附件" : "无附件"}
            />
            <KeyValue
              label="最近备份"
              value={formatNullableDate(conversation.lastMessageAt)}
            />
            <KeyValue
              label="数据完整度"
              value={
                conversation.backupStatus === "complete" ? "100%" : "需检查"
              }
            />
            <KeyValue
              label="风险项"
              value={risks.length ? `${risks.length} 项` : "无"}
            />
          </VStack>
        </Card>

        {risks.length > 0 ? (
          <VStack gap={2}>
            {risks.map((risk) => (
              <VStack
                key={risk.id}
                gap={1}
                className={sx(recordsStyles.riskNotice)}
              >
                <Text weight="bold">{risk.title}</Text>
                <Text type="supporting" color="secondary">
                  {risk.description}
                </Text>
              </VStack>
            ))}
          </VStack>
        ) : null}

        <VStack gap={2}>
          <Text weight="bold">快捷操作</Text>
          <Button
            label="导出此会话"
            variant="primary"
            onClick={() =>
              onNavigate?.("transfer", {
                source: "records-detail",
                mode: "export",
                conversationIds: [conversation.id],
              })
            }
          />
          <Button
            label="重新备份"
            variant="secondary"
            isDisabled={!detail?.canRebackup}
          />
          <Button label="查看附件" variant="secondary" />
          <Button
            label="查看异常"
            variant="secondary"
            isDisabled={risks.length === 0}
          />
          <Button label="添加标签" variant="secondary" />
        </VStack>

        <Card padding={3} variant="transparent">
          <VStack gap={1}>
            <Text weight="bold">导出联动</Text>
            <Text type="supporting" color="secondary">
              点击“导出此会话”后会自动切换到导出模式，并带入这个会话作为默认范围。
            </Text>
          </VStack>
        </Card>
      </VStack>
    </section>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <HStack gap={3} vAlign="center" className={sx(recordsStyles.kvRow)}>
      <Text type="supporting" color="secondary">
        {label}
      </Text>
      <Text weight="bold">{value}</Text>
    </HStack>
  );
}

function formatNullableDate(value: Date | string | undefined) {
  if (!value) {
    return "暂无";
  }

  return formatDate(new Date(value), "MM-dd HH:mm");
}
