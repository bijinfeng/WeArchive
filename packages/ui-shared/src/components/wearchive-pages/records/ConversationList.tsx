import { Button } from "@astryxdesign/core/Button";
import { CheckboxInput } from "@astryxdesign/core/CheckboxInput";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Token } from "@astryxdesign/core/Token";
import type { Conversation } from "@we-archive/core/types";
import { formatNumber } from "@we-archive/core/utils";
import { formatDate } from "date-fns";
import { Search } from "lucide-react";

import { getSearchTargetProps } from "../../wearchive-shell/searchTargets";
import { HighlightedText } from "./messageRenderers";
import type { RecordsFilters } from "./recordsModel";
import {
  getBackupStatusLabel,
  getBackupStatusTone,
  getConversationTypeLabel,
} from "./recordsModel";
import { recordsStyles, sx } from "./styles";

export interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  batchMode: boolean;
  filters: RecordsFilters;
  query: string;
  selectedIds: Set<string>;
  onBatchModeChange: (value: boolean) => void;
  onFiltersChange: (filters: RecordsFilters) => void;
  onQueryChange: (value: string) => void;
  onSelectConversation: (conversationId: string) => void;
  onToggleSelected: (conversationId: string) => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  batchMode,
  filters,
  query,
  selectedIds,
  onBatchModeChange,
  onFiltersChange,
  onQueryChange,
  onSelectConversation,
  onToggleSelected,
}: ConversationListProps) {
  return (
    <VStack
      gap={3}
      role="region"
      aria-label="会话列表"
      className={sx(recordsStyles.conversationPane)}
    >
      <HStack gap={2} vAlign="center" className={sx(recordsStyles.header)}>
        <VStack gap={0}>
          <Text weight="bold">会话列表</Text>
          <Text type="supporting" color="secondary">
            筛选条件变化后立即生效。
          </Text>
        </VStack>
        <Button
          label={batchMode ? "退出选择" : "选择会话"}
          variant={batchMode ? "primary" : "secondary"}
          size="sm"
          onClick={() => onBatchModeChange(!batchMode)}
        />
      </HStack>

      <TextInput
        className={sx(recordsStyles.searchInput)}
        label="搜索聊天记录"
        isLabelHidden
        placeholder="搜索联系人、群聊、摘要"
        value={query}
        width="100%"
        startIcon={Search}
        hasClear
        onChange={onQueryChange}
      />

      <HStack gap={2} className={sx(recordsStyles.filterRow)}>
        <FilterButton
          label="仅附件"
          active={filters.hasAttachments}
          onClick={() =>
            onFiltersChange({
              ...filters,
              hasAttachments: !filters.hasAttachments,
            })
          }
        />
        <FilterButton
          label="群聊"
          active={filters.type === "group"}
          onClick={() =>
            onFiltersChange({
              ...filters,
              type: filters.type === "group" ? "all" : "group",
            })
          }
        />
        <FilterButton
          label="部分完成"
          active={filters.backupStatus === "partial"}
          onClick={() =>
            onFiltersChange({
              ...filters,
              backupStatus:
                filters.backupStatus === "partial" ? "all" : "partial",
            })
          }
        />
        <FilterButton
          label="收藏"
          active={filters.favoritesOnly}
          onClick={() =>
            onFiltersChange({
              ...filters,
              favoritesOnly: !filters.favoritesOnly,
            })
          }
        />
      </HStack>

      {conversations.length > 0 ? (
        <VStack gap={2} className={sx(recordsStyles.conversationList)}>
          {conversations.map((conversation) => (
            <ConversationRow
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              isBatchMode={batchMode}
              isSelected={selectedIds.has(conversation.id)}
              query={query}
              onSelectConversation={onSelectConversation}
              onToggleSelected={onToggleSelected}
            />
          ))}
        </VStack>
      ) : (
        <VStack gap={2} className={sx(recordsStyles.empty)}>
          <Text weight="bold">没有符合条件的消息</Text>
          <Text type="supporting" color="secondary">
            尝试调整筛选条件，或清空筛选查看全部内容。
          </Text>
          <Button
            label="清空筛选"
            variant="secondary"
            onClick={() => {
              onQueryChange("");
              onFiltersChange({
                type: "all",
                backupStatus: "all",
                hasAttachments: false,
                favoritesOnly: false,
              });
            }}
          />
        </VStack>
      )}
    </VStack>
  );
}

function ConversationRow({
  conversation,
  isActive,
  isBatchMode,
  isSelected,
  query,
  onSelectConversation,
  onToggleSelected,
}: {
  conversation: Conversation;
  isActive: boolean;
  isBatchMode: boolean;
  isSelected: boolean;
  query: string;
  onSelectConversation: (conversationId: string) => void;
  onToggleSelected: (conversationId: string) => void;
}) {
  const rowContent = (
    <>
      {isBatchMode ? (
        <CheckboxInput
          className={sx(recordsStyles.selectionBox)}
          label={`选择 ${conversation.name}`}
          isLabelHidden
          size="sm"
          value={isSelected}
          onChange={(_, event) => {
            event.stopPropagation();
            onToggleSelected(conversation.id);
          }}
          onClick={(event) => event.stopPropagation()}
        />
      ) : null}
      <Text className={sx(recordsStyles.avatar)}>
        {conversation.name.slice(0, 1)}
      </Text>
      <VStack gap={1} className={sx(recordsStyles.rowMeta)}>
        <HStack gap={2} vAlign="center">
          <Text weight="bold">
            <HighlightedText text={conversation.name} query={query} />
          </Text>
          <Token
            label={getConversationTypeLabel(conversation.type)}
            color="gray"
            size="sm"
          />
        </HStack>
        <Text type="supporting" color="secondary">
          <HighlightedText
            text={conversation.lastMessagePreview}
            query={query}
          />
        </Text>
        <HStack gap={2} vAlign="center">
          {conversation.hasAttachments ? (
            <Token label="附件" color="blue" size="sm" />
          ) : null}
          {conversation.isFavorite ? (
            <Token label="收藏" color="orange" size="sm" />
          ) : null}
          <Token
            label={getBackupStatusLabel(conversation.backupStatus)}
            color={getBackupStatusTone(conversation.backupStatus)}
            size="sm"
          />
        </HStack>
      </VStack>
      <VStack gap={1} className={sx(recordsStyles.rowEnd)}>
        <Text type="supporting" color="secondary">
          {formatConversationTime(conversation.lastMessageAt)}
        </Text>
        <Text type="supporting" color="secondary">
          {formatNumber(conversation.messageCount)}
        </Text>
      </VStack>
    </>
  );

  return (
    <button
      type="button"
      className={sx(
        recordsStyles.conversationRow,
        isActive && recordsStyles.conversationRowSelected,
        isBatchMode && recordsStyles.conversationRowBatch,
      )}
      onClick={() => onSelectConversation(conversation.id)}
      {...getSearchTargetProps(
        `${conversation.name} ${conversation.lastMessagePreview} ${conversation.conversationId}`,
        { preserveTabIndex: true },
      )}
    >
      {rowContent}
    </button>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      label={label}
      variant={active ? "primary" : "secondary"}
      size="sm"
      onClick={onClick}
    />
  );
}

function formatConversationTime(value: Date | string | undefined) {
  if (!value) {
    return "暂无";
  }

  return formatDate(new Date(value), "MM-dd HH:mm");
}
