import { Button } from "@astryxdesign/core/Button";
import { ListItem } from "@astryxdesign/core/List";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import type { StatusDotVariant } from "@astryxdesign/core/StatusDot";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Text } from "@astryxdesign/core/Text";
import { Token } from "@astryxdesign/core/Token";
import type { BackupTask } from "@we-archive/core/types";
import { formatNumber } from "@we-archive/core/utils";
import { sx, taskStyles } from "./styles";
import type { TaskActionId, TaskTone } from "./tasksModel";
import { getTaskActions, getTaskStatusMeta } from "./tasksModel";

export interface TaskRowProps {
  task: BackupTask;
  onAction: (action: TaskActionId, task: BackupTask) => void;
}

export function TaskRow({ task, onAction }: TaskRowProps) {
  const title = getTaskTitle(task);
  const meta = getTaskStatusMeta(task.status);
  const progress = clampProgress(task.progress);
  const stepText =
    task.currentStep && task.currentStep !== meta.label
      ? task.currentStep
      : meta.description;

  return (
    <ListItem
      role="region"
      aria-label={`任务 ${title}`}
      className={sx(taskStyles.row)}
      startContent={
        <StatusDot
          variant={toStatusDotVariant(meta.tone)}
          label={meta.label}
          isPulsing={["scanning", "backing-up", "verifying"].includes(
            task.status,
          )}
        />
      }
      label={
        <VStack gap={3} className={sx(taskStyles.rowBody)}>
          <HStack gap={3} vAlign="start" className={sx(taskStyles.rowHeader)}>
            <VStack gap={1}>
              <HStack
                gap={2}
                vAlign="center"
                className={sx(taskStyles.rowMeta)}
              >
                <Text weight="bold" className={sx(taskStyles.singleLineText)}>
                  {title}
                </Text>
                <Token label={meta.label} color={meta.tone} size="sm" />
              </HStack>
              <Text
                type="supporting"
                color="secondary"
                className={sx(taskStyles.multiLineText)}
              >
                {stepText}
              </Text>
            </VStack>
            <TaskActions task={task} onAction={onAction} />
          </HStack>

          <VStack gap={1} className={sx(taskStyles.progressArea)}>
            <ProgressBar
              label={`${title} 进度`}
              value={progress}
              hasValueLabel
              variant={meta.progressVariant}
              isDisabled={task.status === "cancelled"}
            />
            <HStack gap={2} className={sx(taskStyles.rowMeta)}>
              <Text type="supporting" color="secondary">
                {formatTaskScope(task)}
              </Text>
              <Text type="supporting" color="secondary">
                {formatTaskStats(task)}
              </Text>
              <Text
                type="supporting"
                color="secondary"
                className={sx(taskStyles.singleLineText)}
              >
                {task.savePath}
              </Text>
            </HStack>
          </VStack>
        </VStack>
      }
    />
  );
}

function TaskActions({
  task,
  onAction,
}: {
  task: BackupTask;
  onAction: TaskRowProps["onAction"];
}) {
  return (
    <HStack gap={2} className={sx(taskStyles.actionGroup)}>
      {getTaskActions(task).map((action) => (
        <Button
          key={action.id}
          label={action.label}
          variant={action.variant}
          size="sm"
          onClick={() => onAction(action.id, task)}
        />
      ))}
    </HStack>
  );
}

export function getTaskTitle(task: BackupTask) {
  return task.title ?? task.currentStep ?? `任务 #${task.id}`;
}

function clampProgress(progress: number | null) {
  if (progress == null || Number.isNaN(progress)) {
    return 0;
  }

  return Math.min(100, Math.max(0, progress));
}

function toStatusDotVariant(tone: TaskTone): StatusDotVariant {
  if (tone === "red") {
    return "error";
  }

  if (tone === "orange") {
    return "warning";
  }

  if (tone === "blue") {
    return "accent";
  }

  if (tone === "gray") {
    return "neutral";
  }

  return "success";
}

function formatTaskScope(task: BackupTask) {
  return [
    task.accountName ? `账号：${task.accountName}` : null,
    task.scope ?? null,
    task.currentFile ? `当前：${task.currentFile}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function formatTaskStats(task: BackupTask) {
  const stats = [
    typeof task.processedMessages === "number"
      ? `消息 ${formatNumber(task.processedMessages)}`
      : null,
    typeof task.processedAttachments === "number"
      ? `附件 ${formatNumber(task.processedAttachments)}`
      : null,
    task.speed,
    task.remainingTime ? `剩余 ${task.remainingTime}` : null,
    task.warningCount ? `警告 ${task.warningCount}` : null,
    task.errorCount ? `错误 ${task.errorCount}` : null,
  ].filter(Boolean);

  return stats.length > 0 ? stats.join(" · ") : "等待任务统计";
}
