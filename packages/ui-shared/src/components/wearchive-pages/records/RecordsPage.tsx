import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import type { Conversation } from "@we-archive/core/types";
import { useEffect, useMemo, useState } from "react";

import {
  useConversationDetail,
  useConversationList,
  useMessages,
} from "../../../hooks";
import { BatchActionBar } from "./BatchActionBar";
import { ConversationDetailPanel } from "./ConversationDetailPanel";
import { ConversationList } from "./ConversationList";
import { MessageStream } from "./MessageStream";
import {
  DEFAULT_RECORDS_FILTERS,
  filterConversations,
  type RecordsFilters,
  type RecordsPageProps,
} from "./recordsModel";
import { recordsStyles, sx } from "./styles";

export type { RecordsNavigationIntent, RecordsPageProps } from "./recordsModel";

export function RecordsPage({
  conversations,
  detailsByConversationId,
  messagesByConversationId,
  query = "",
  selectedConversationId,
  isLoading = false,
  onSelectedConversationChange,
  onNavigate,
}: RecordsPageProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    selectedConversationId ?? conversations[0]?.id ?? null,
  );
  const [localQuery, setLocalQuery] = useState(query);
  const [filters, setFilters] = useState<RecordsFilters>(
    DEFAULT_RECORDS_FILTERS,
  );
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const activeConversationId = selectedConversationId ?? internalSelectedId;
  const filteredConversations = useMemo(
    () => filterConversations(conversations, localQuery, filters),
    [conversations, filters, localQuery],
  );
  const activeConversation =
    filteredConversations.find((item) => item.id === activeConversationId) ??
    filteredConversations[0] ??
    conversations.find((item) => item.id === activeConversationId) ??
    null;
  const detail = activeConversation
    ? (detailsByConversationId[activeConversation.id] ?? null)
    : null;
  const messages = activeConversation
    ? (messagesByConversationId[activeConversation.id] ?? [])
    : [];

  useEffect(() => {
    if (selectedConversationId) {
      setInternalSelectedId(selectedConversationId);
      return;
    }

    if (!internalSelectedId && conversations[0]) {
      setInternalSelectedId(conversations[0].id);
    }
  }, [conversations, internalSelectedId, selectedConversationId]);

  useEffect(() => {
    const nextConversationId = filteredConversations[0]?.id;

    if (
      nextConversationId &&
      activeConversationId !== nextConversationId &&
      !filteredConversations.some((item) => item.id === activeConversationId)
    ) {
      setInternalSelectedId(nextConversationId);
      onSelectedConversationChange?.(nextConversationId);
    }
  }, [
    activeConversationId,
    filteredConversations,
    onSelectedConversationChange,
  ]);

  const handleSelectConversation = (conversationId: string) => {
    setInternalSelectedId(conversationId);
    onSelectedConversationChange?.(conversationId);
  };

  const handleToggleSelected = (conversationId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(conversationId)) {
        next.delete(conversationId);
      } else {
        next.add(conversationId);
      }

      return next;
    });
  };

  const handleBatchModeChange = (value: boolean) => {
    setBatchMode(value);

    if (!value) {
      setSelectedIds(new Set());
    }
  };

  return (
    <VStack gap={4} className={sx(recordsStyles.page)}>
      <HStack gap={3} vAlign="center" className={sx(recordsStyles.header)}>
        <VStack gap={1} className={sx(recordsStyles.title)}>
          <Text weight="bold">聊天记录</Text>
          <Text type="supporting" color="secondary">
            按设计稿的三栏工作台浏览、搜索和批量处理聊天记录
          </Text>
        </VStack>
        <Text type="supporting" color="secondary">
          {isLoading ? "同步中" : `${conversations.length} 个会话`}
        </Text>
      </HStack>

      {batchMode ? (
        <BatchActionBar
          selectedIds={[...selectedIds]}
          onClear={() => setSelectedIds(new Set())}
          onNavigate={onNavigate}
        />
      ) : null}

      <Card padding={0} className={sx(recordsStyles.layout)}>
        <ConversationList
          conversations={filteredConversations}
          activeConversationId={activeConversation?.id ?? null}
          batchMode={batchMode}
          filters={filters}
          query={localQuery}
          selectedIds={selectedIds}
          onBatchModeChange={handleBatchModeChange}
          onFiltersChange={setFilters}
          onQueryChange={setLocalQuery}
          onSelectConversation={handleSelectConversation}
          onToggleSelected={handleToggleSelected}
        />
        <MessageStream
          conversation={activeConversation}
          messages={messages}
          query={localQuery}
        />
        <VStack gap={0} className={sx(recordsStyles.hiddenOnMedium)}>
          <ConversationDetailPanel
            conversation={activeConversation}
            detail={detail}
            onNavigate={onNavigate}
          />
        </VStack>
      </Card>
    </VStack>
  );
}

export function RecordsPageController({
  query = "",
  onNavigate,
}: {
  query?: string | undefined;
  onNavigate?: RecordsPageProps["onNavigate"];
}) {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >();
  const listParams = {
    limit: 50,
    offset: 0,
    ...(query ? { query } : {}),
  };
  const conversationsQuery = useConversationList(listParams);
  const conversations = conversationsQuery.data?.items ?? [];
  const selectedConversation =
    conversations.find((item) => item.id === selectedConversationId) ??
    conversations[0];
  const detailQuery = useConversationDetail(selectedConversation?.id);
  const messageParams = selectedConversation
    ? {
        conversationId: selectedConversation.id,
        limit: 100,
        ...(query ? { query } : {}),
      }
    : undefined;
  const messagesQuery = useMessages(messageParams);

  useEffect(() => {
    if (!selectedConversationId && conversations[0]) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  return (
    <RecordsPage
      conversations={conversations}
      detailsByConversationId={toDetailMap(
        selectedConversation,
        detailQuery.data,
      )}
      messagesByConversationId={toMessageMap(
        selectedConversation,
        messagesQuery.data?.items,
      )}
      query={query}
      selectedConversationId={selectedConversation?.id}
      isLoading={
        conversationsQuery.isLoading ||
        detailQuery.isLoading ||
        messagesQuery.isLoading
      }
      onSelectedConversationChange={setSelectedConversationId}
      onNavigate={onNavigate}
    />
  );
}

function toDetailMap(
  conversation: Conversation | undefined,
  detail: RecordsPageProps["detailsByConversationId"][string] | undefined,
) {
  return conversation && detail ? { [conversation.id]: detail } : {};
}

function toMessageMap(
  conversation: Conversation | undefined,
  messages: RecordsPageProps["messagesByConversationId"][string] | undefined,
) {
  return conversation && messages ? { [conversation.id]: messages } : {};
}
