import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Token } from "@astryxdesign/core/Token";
import type { Message } from "@we-archive/core/types";

import { MESSAGE_TYPE_LABELS } from "./recordsModel";
import { recordsStyles, sx } from "./styles";

const PLACEHOLDER_COPY: Partial<
  Record<
    Message["type"],
    {
      label: string;
      tone: "blue" | "gray" | "green" | "orange";
      description: string;
    }
  >
> = {
  link: {
    label: "链接预览",
    tone: "blue",
    description: "保留链接标题、域名和时间信息。",
  },
  miniprogram: {
    label: "小程序卡片",
    tone: "green",
    description: "保留小程序名称和原始卡片内容。",
  },
  location: {
    label: "位置",
    tone: "blue",
    description: "保留地点名称和原始位置 payload。",
  },
  "contact-card": {
    label: "联系人名片",
    tone: "green",
    description: "保留联系人名称、微信号和原始名片信息。",
  },
  "group-notice": {
    label: "群公告",
    tone: "orange",
    description: "保留公告正文和发布时间。",
  },
  merged: {
    label: "合并聊天记录",
    tone: "gray",
    description: "保留合并转发摘要，可在详情中查看原始 payload。",
  },
  transfer: {
    label: "转账",
    tone: "orange",
    description: "转账记录以只读占位展示。",
  },
  "red-packet": {
    label: "红包",
    tone: "orange",
    description: "红包记录以只读占位展示。",
  },
  unknown: {
    label: "未知",
    tone: "orange",
    description: "该消息类型暂不支持还原，已保留原始 payload。",
  },
};

export function MessageContent({
  message,
  query,
}: {
  message: Message;
  query: string;
}) {
  const content = message.content ?? getMessageFallback(message);

  if (message.type === "system") {
    return (
      <Text type="supporting" className={sx(recordsStyles.systemMessage)}>
        {content}
      </Text>
    );
  }

  if (message.type === "image" || message.type === "video") {
    return (
      <VStack gap={2}>
        <Text>
          {message.type === "image" ? "图片消息" : "视频消息"} ·{" "}
          <HighlightedText text={content} query={query} />
        </Text>
        <Card
          padding={3}
          variant="transparent"
          className={sx(recordsStyles.attachment)}
        >
          <Text type="supporting" color="secondary">
            点击后打开预览层，当前为只读备份记录。
          </Text>
        </Card>
      </VStack>
    );
  }

  if (message.type === "voice") {
    return (
      <VStack gap={2}>
        <HighlightedText text={content} query={query} />
        <Text type="supporting" color="secondary">
          语音消息 · 转写状态会在后续版本补充。
        </Text>
      </VStack>
    );
  }

  if (message.type === "file") {
    return (
      <VStack gap={2}>
        <HighlightedText text={content} query={query} />
        <Card
          padding={3}
          variant="transparent"
          className={sx(recordsStyles.attachment)}
        >
          <Text type="supporting" color="secondary">
            文件详情占位，不直接下载。
          </Text>
        </Card>
      </VStack>
    );
  }

  const placeholder = PLACEHOLDER_COPY[message.type];

  if (placeholder) {
    return (
      <PlaceholderMessage
        label={placeholder.label}
        tone={placeholder.tone}
        description={placeholder.description}
        content={content}
        query={query}
      />
    );
  }

  return <HighlightedText text={content} query={query} />;
}

function PlaceholderMessage({
  label,
  tone,
  description,
  content,
  query,
}: {
  label: string;
  tone: "blue" | "gray" | "green" | "orange";
  description: string;
  content: string;
  query: string;
}) {
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Token label={label} color={tone} size="sm" />
        <Text type="supporting" color="secondary">
          {description}
        </Text>
      </HStack>
      <HighlightedText text={content} query={query} />
    </VStack>
  );
}

export function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return <>{text}</>;
  }

  const lowerText = text.toLowerCase();
  const start = lowerText.indexOf(normalizedQuery);

  if (start < 0) {
    return <>{text}</>;
  }

  const end = start + normalizedQuery.length;

  return (
    <>
      {text.slice(0, start)}
      <mark className={sx(recordsStyles.highlight)}>
        {text.slice(start, end)}
      </mark>
      {text.slice(end)}
    </>
  );
}

function getMessageFallback(message: Message) {
  return `[${MESSAGE_TYPE_LABELS[message.type]}消息]`;
}
