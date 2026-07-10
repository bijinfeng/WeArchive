import { Button } from "@astryxdesign/core/Button";
import { List, ListItem } from "@astryxdesign/core/List";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import type { StatusDotVariant } from "@astryxdesign/core/StatusDot";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Text } from "@astryxdesign/core/Text";
import { Token } from "@astryxdesign/core/Token";

import { sx, transferStyles } from "./styles";
import type { TransferQueueItem } from "./transferState";

export interface TransferTaskQueueProps {
  items: TransferQueueItem[];
  onUpdateItem: (itemId: string, status: TransferQueueItem["status"]) => void;
}

export function TransferTaskQueue({
  items,
  onUpdateItem,
}: TransferTaskQueueProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <VStack gap={0} className={sx(transferStyles.queue)}>
      <HStack
        gap={3}
        vAlign="center"
        className={sx(transferStyles.queueHeader)}
      >
        <VStack gap={0}>
          <Text weight="bold">底部任务队列</Text>
          <Text type="supporting" color="secondary">
            导入和导出任务会保留在这里，可暂停、继续、重试或查看结果。
          </Text>
        </VStack>
        <Token label={`${items.length} 个任务`} color="green" size="sm" />
      </HStack>
      <List density="compact" hasDividers>
        {items.map((item) => (
          <ListItem
            key={item.id}
            className={sx(transferStyles.queueRow)}
            startContent={
              <StatusDot
                variant={getStatusVariant(item.status)}
                label={getStatusLabel(item.status)}
              />
            }
            label={
              <VStack gap={2}>
                <HStack
                  gap={2}
                  vAlign="center"
                  className={sx(transferStyles.rowMeta)}
                >
                  <Text weight="bold">{item.name}</Text>
                  <Token
                    label={item.type === "import" ? "导入" : "导出"}
                    color={item.type === "import" ? "green" : "blue"}
                    size="sm"
                  />
                  <Token
                    label={getStatusLabel(item.status)}
                    color={getTokenColor(item.status)}
                    size="sm"
                  />
                </HStack>
                <Text type="supporting" color="secondary">
                  {item.stage} · 剩余 {item.remainingTime}
                </Text>
                <ProgressBar
                  label={`${item.name} 进度`}
                  value={item.progress}
                  hasValueLabel
                  variant={item.status === "failed" ? "error" : "accent"}
                />
                <HStack gap={2} className={sx(transferStyles.actions)}>
                  {item.status === "running" ? (
                    <Button
                      label="暂停"
                      variant="secondary"
                      size="sm"
                      onClick={() => onUpdateItem(item.id, "paused")}
                    />
                  ) : null}
                  {item.status === "paused" ? (
                    <Button
                      label="继续"
                      variant="primary"
                      size="sm"
                      onClick={() => onUpdateItem(item.id, "running")}
                    />
                  ) : null}
                  {item.status === "failed" ? (
                    <Button
                      label="重试"
                      variant="primary"
                      size="sm"
                      onClick={() => onUpdateItem(item.id, "running")}
                    />
                  ) : null}
                  <Button label="查看详情" variant="secondary" size="sm" />
                  {item.status === "completed" ? (
                    <Button label="打开结果" variant="primary" size="sm" />
                  ) : null}
                </HStack>
              </VStack>
            }
          />
        ))}
      </List>
    </VStack>
  );
}

function getStatusLabel(status: TransferQueueItem["status"]) {
  if (status === "running") {
    return "处理中";
  }
  if (status === "paused") {
    return "已暂停";
  }
  if (status === "completed") {
    return "已完成";
  }
  if (status === "failed") {
    return "失败";
  }
  return "等待中";
}

function getStatusVariant(
  status: TransferQueueItem["status"],
): StatusDotVariant {
  if (status === "failed") {
    return "error";
  }
  if (status === "paused" || status === "waiting") {
    return "warning";
  }
  if (status === "completed") {
    return "success";
  }
  return "accent";
}

function getTokenColor(status: TransferQueueItem["status"]) {
  if (status === "failed") {
    return "red";
  }
  if (status === "paused" || status === "waiting") {
    return "orange";
  }
  if (status === "completed") {
    return "green";
  }
  return "blue";
}
