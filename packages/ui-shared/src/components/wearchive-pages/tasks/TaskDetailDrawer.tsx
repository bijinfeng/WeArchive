import { Button } from "@astryxdesign/core/Button";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Token } from "@astryxdesign/core/Token";
import type { BackupTask, TaskLog } from "@we-archive/core/types";
import { formatNumber } from "@we-archive/core/utils";
import { useState } from "react";

import { DetailDrawer } from "../../wearchive-feedback";
import { sx, taskStyles } from "./styles";
import { type TaskLogFilter, TaskLogList } from "./TaskLogList";
import { getTaskTitle } from "./TaskRow";
import { getTaskStatusMeta } from "./tasksModel";

export interface TaskDetailDrawerProps {
  task: BackupTask | null;
  logs: TaskLog[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function TaskDetailDrawer({
  task,
  logs,
  isOpen,
  onOpenChange,
}: TaskDetailDrawerProps) {
  const [filter, setFilter] = useState<TaskLogFilter>("all");

  if (!task) {
    return null;
  }

  const title = getTaskTitle(task);
  const meta = getTaskStatusMeta(task.status);

  return (
    <DetailDrawer
      isOpen={isOpen}
      title={`${title} - 详情`}
      subtitle={meta.description}
      ariaLabel={`${title} - 详情`}
      onOpenChange={onOpenChange}
      footer={
        <HStack gap={2} className={sx(taskStyles.actionGroup)}>
          <Button label="复制错误" variant="secondary" size="sm" />
          <Button label="导出日志" variant="primary" size="sm" />
        </HStack>
      }
    >
      <VStack gap={5}>
        <VStack gap={3} className={sx(taskStyles.detailSection)}>
          <HStack gap={2} vAlign="center">
            <Text weight="bold">任务详情</Text>
            <Token label={meta.label} color={meta.tone} size="sm" />
          </HStack>
          <section className={sx(taskStyles.kvGrid)} aria-label="任务数据">
            <Metric label="当前步骤" value={task.currentStep ?? meta.label} />
            <Metric label="保存位置" value={task.savePath} />
            <Metric
              label="消息"
              value={formatOptionalNumber(task.processedMessages)}
            />
            <Metric
              label="附件"
              value={formatOptionalNumber(task.processedAttachments)}
            />
            <Metric label="速度" value={task.speed ?? "暂无"} />
            <Metric label="剩余时间" value={task.remainingTime ?? "暂无"} />
            <Metric
              label="警告"
              value={formatOptionalNumber(task.warningCount)}
            />
            <Metric
              label="错误"
              value={formatOptionalNumber(task.errorCount)}
            />
          </section>
        </VStack>

        <VStack gap={3} className={sx(taskStyles.detailSection)}>
          <HStack gap={3} vAlign="center" className={sx(taskStyles.logActions)}>
            <Text weight="bold">日志</Text>
            <SegmentedControl
              value={filter}
              onChange={(value) => setFilter(value as TaskLogFilter)}
              label="日志等级"
              size="sm"
            >
              <SegmentedControlItem value="all" label="全部" />
              <SegmentedControlItem value="info" label="信息" />
              <SegmentedControlItem value="warn" label="警告" />
              <SegmentedControlItem value="error" label="错误" />
            </SegmentedControl>
          </HStack>
          <TaskLogList logs={logs} filter={filter} />
        </VStack>
      </VStack>
    </DetailDrawer>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <VStack gap={1} className={sx(taskStyles.kvItem)}>
      <Text type="supporting" color="secondary">
        {label}
      </Text>
      <Text className={sx(taskStyles.multiLineText)}>{value}</Text>
    </VStack>
  );
}

function formatOptionalNumber(value: number | null | undefined) {
  return typeof value === "number" ? formatNumber(value) : "暂无";
}
