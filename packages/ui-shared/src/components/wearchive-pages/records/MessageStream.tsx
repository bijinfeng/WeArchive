import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Token } from "@astryxdesign/core/Token";
import type { Conversation, Message } from "@we-archive/core/types";
import { formatNumber } from "@we-archive/core/utils";
import { formatDate } from "date-fns";

import { getSearchTargetProps } from "../../wearchive-shell/searchTargets";
import { MessageContent } from "./messageRenderers";
import { MESSAGE_TYPE_LABELS } from "./recordsModel";
import { recordsStyles, sx } from "./styles";

export interface MessageStreamProps {
  conversation: Conversation | null;
  messages: Message[];
  query: string;
}

export function MessageStream({
  conversation,
  messages,
  query,
}: MessageStreamProps) {
  return (
    <section aria-label="消息预览" className={sx(recordsStyles.messagePane)}>
      <HStack gap={3} vAlign="center" className={sx(recordsStyles.paneHeader)}>
        <VStack gap={1} className={sx(recordsStyles.title)}>
          <Text weight="bold">{conversation?.name ?? "未选择会话"}</Text>
          <Text type="supporting" color="secondary">
            {conversation
              ? `${formatNumber(conversation.messageCount)} 条消息 · ${conversation.memberCount} 位成员`
              : "选择左侧会话后查看消息"}
          </Text>
        </VStack>
        {conversation ? (
          <Token
            label={
              conversation.backupStatus === "partial" ? "需检查" : "可导出"
            }
            color={conversation.backupStatus === "partial" ? "orange" : "green"}
            size="sm"
          />
        ) : null}
      </HStack>

      <VStack gap={3} className={sx(recordsStyles.messageList)}>
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageRow key={message.id} message={message} query={query} />
          ))
        ) : (
          <VStack gap={2} className={sx(recordsStyles.empty)}>
            <Text weight="bold">没有找到相关内容</Text>
            <Text type="supporting" color="secondary">
              请换一个关键词，或检查当前页面筛选条件。
            </Text>
          </VStack>
        )}
        {messages.length > 0 ? (
          <Text
            type="supporting"
            color="secondary"
            className={sx(recordsStyles.systemMessage)}
          >
            已到最新
          </Text>
        ) : null}
      </VStack>

      <HStack
        gap={2}
        vAlign="center"
        className={sx(recordsStyles.messageTools)}
      >
        <Card
          padding={2}
          variant="transparent"
          className={sx(recordsStyles.readonlyInput)}
        >
          <Text type="supporting" color="secondary">
            只读备份记录，不能在这里发送消息
          </Text>
        </Card>
        <Button label="定位第一个命中" variant="secondary" />
      </HStack>
    </section>
  );
}

function MessageRow({ message, query }: { message: Message; query: string }) {
  const isOwn = message.senderName === "我";

  if (message.type === "system") {
    return (
      <Text
        type="supporting"
        className={sx(recordsStyles.systemMessage)}
        {...getSearchTargetProps(message.content ?? "")}
      >
        {message.content ?? "系统消息"}
      </Text>
    );
  }

  return (
    <VStack
      gap={1}
      className={sx(
        recordsStyles.messageRow,
        isOwn && recordsStyles.messageRowOwn,
      )}
      {...getSearchTargetProps(
        `${message.senderName ?? ""} ${message.content ?? ""}`,
      )}
    >
      <HStack gap={2} vAlign="center">
        <Text type="supporting" color="secondary">
          {message.senderName ?? "未知发送者"} ·{" "}
          {formatDate(new Date(message.timestamp), "HH:mm")}
        </Text>
        <Token
          label={MESSAGE_TYPE_LABELS[message.type]}
          color="gray"
          size="sm"
        />
      </HStack>
      <Card
        padding={3}
        className={sx(recordsStyles.bubble, isOwn && recordsStyles.bubbleOwn)}
      >
        <MessageContent message={message} query={query} />
      </Card>
    </VStack>
  );
}
