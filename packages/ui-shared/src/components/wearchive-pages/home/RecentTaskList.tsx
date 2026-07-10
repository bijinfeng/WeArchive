import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Text } from "@astryxdesign/core/Text";
import { Token } from "@astryxdesign/core/Token";
import type {
  WeArchiveOverviewTask,
  WeArchiveViewId,
} from "@we-archive/core/types";

import { EmptyAction } from "../../wearchive-feedback";
import { getSearchTargetProps } from "../../wearchive-shell/searchTargets";
import type { HomeNavigationIntent } from "./homeModel";
import { homeStyles, sx } from "./styles";

export interface RecentTaskListProps {
  tasks: WeArchiveOverviewTask[];
  onBackupAction?: (() => void | Promise<void>) | undefined;
  onNavigate?:
    | ((viewId: WeArchiveViewId, intent?: HomeNavigationIntent) => void)
    | undefined;
}

export function RecentTaskList({
  tasks,
  onBackupAction,
  onNavigate,
}: RecentTaskListProps) {
  return (
    <Card padding={4} role="region" aria-label="最近任务">
      <VStack gap={3}>
        <HStack gap={2} className={sx(homeStyles.header)} vAlign="center">
          <Text weight="bold">最近任务</Text>
          <Button
            label="全部任务"
            variant="ghost"
            size="sm"
            onClick={() => onNavigate?.("backup", { source: "home-task" })}
          />
        </HStack>

        {tasks.length > 0 ? (
          <VStack gap={2}>
            {tasks.slice(0, 4).map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onClick={() =>
                  onNavigate?.("backup", {
                    source: "home-task",
                    metric: String(task.id),
                  })
                }
              />
            ))}
          </VStack>
        ) : (
          <EmptyAction
            title="暂无备份任务"
            description="创建一次备份后会显示任务进度。"
            actionLabel="立即备份"
            onAction={() => {
              void onBackupAction?.();
            }}
          />
        )}
      </VStack>
    </Card>
  );
}

function TaskRow({
  task,
  onClick,
}: {
  task: WeArchiveOverviewTask;
  onClick: () => void;
}) {
  const tone = getTaskTone(task.status);

  return (
    <button
      type="button"
      className={sx(homeStyles.taskRow)}
      onClick={onClick}
      {...getSearchTargetProps(
        `任务 ${task.id} ${task.status ?? ""} ${task.currentStep ?? ""}`,
      )}
    >
      <HStack gap={3} vAlign="center">
        <StatusDot
          variant={tone === "red" ? "error" : "success"}
          label={task.status ?? "waiting"}
        />
        <VStack gap={0}>
          <Text>任务 #{task.id}</Text>
          <Text type="supporting" color="secondary">
            {task.currentStep ?? `进度 ${task.progress ?? 0}%`}
          </Text>
        </VStack>
      </HStack>
      <Token label={getTaskLabel(task.status)} color={tone} size="sm" />
    </button>
  );
}

function getTaskTone(
  status: string | undefined,
): "green" | "blue" | "orange" | "red" {
  if (status === "failed") {
    return "red";
  }

  if (status === "partial" || status === "paused" || status === "waiting") {
    return "orange";
  }

  if (status === "running") {
    return "blue";
  }

  return "green";
}

function getTaskLabel(status: string | undefined) {
  if (status === "running") {
    return "进行中";
  }

  if (status === "waiting") {
    return "等待中";
  }

  if (status === "paused") {
    return "已暂停";
  }

  if (status === "failed") {
    return "失败";
  }

  if (status === "partial") {
    return "部分完成";
  }

  return "已完成";
}
