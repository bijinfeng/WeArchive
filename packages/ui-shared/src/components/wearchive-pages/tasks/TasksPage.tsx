import { Button } from "@astryxdesign/core/Button";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import type { BackupTask, TaskLog, TaskStatus } from "@we-archive/core/types";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ConfirmDialog } from "../../wearchive-feedback";
import { sx, taskStyles } from "./styles";
import { TaskBoard } from "./TaskBoard";
import { TaskDetailDrawer } from "./TaskDetailDrawer";
import { TaskSummary } from "./TaskSummary";
import type { TaskActionId } from "./tasksModel";
import { summarizeTasks } from "./tasksModel";

export interface TasksPageProps {
  tasks: BackupTask[];
  logsByTaskId?: Record<number, TaskLog[]>;
  query?: string;
  isLoading?: boolean;
  onCreateBackup?: () => void | Promise<void>;
  onTaskAction?: (action: TaskActionId, taskId: number) => void | Promise<void>;
  onLoadTaskLogs?: (taskId: number) => Promise<TaskLog[]>;
}

const CANCEL_CONFIRM_TEXT =
  "确定取消这个任务吗？已完成的备份会保留，未完成部分不会继续。";

export function TasksPage({
  tasks,
  logsByTaskId = {},
  query = "",
  isLoading = false,
  onCreateBackup,
  onTaskAction,
  onLoadTaskLogs,
}: TasksPageProps) {
  const [localTasks, setLocalTasks] = useState(tasks);
  const [localLogsByTaskId, setLocalLogsByTaskId] = useState(logsByTaskId);
  const [cancelTask, setCancelTask] = useState<BackupTask | null>(null);
  const [detailTaskId, setDetailTaskId] = useState<number | null>(null);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    setLocalLogsByTaskId(logsByTaskId);
  }, [logsByTaskId]);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleTasks = useMemo(() => {
    if (!normalizedQuery) {
      return localTasks;
    }

    return localTasks.filter((task) =>
      [
        task.title,
        task.accountName,
        task.scope,
        task.status,
        task.currentStep,
        task.currentFile,
        task.savePath,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [localTasks, normalizedQuery]);
  const detailTask =
    detailTaskId == null
      ? null
      : (localTasks.find((task) => task.id === detailTaskId) ?? null);

  const openDetail = useCallback(
    (task: BackupTask) => {
      setDetailTaskId(task.id);

      if (!localLogsByTaskId[task.id] && onLoadTaskLogs) {
        void onLoadTaskLogs(task.id).then((logs) => {
          setLocalLogsByTaskId((current) => ({
            ...current,
            [task.id]: logs,
          }));
        });
      }
    },
    [localLogsByTaskId, onLoadTaskLogs],
  );

  const applyTaskPatch = useCallback(
    (taskId: number, patch: Partial<BackupTask>) => {
      setLocalTasks((current) =>
        current.map((task) =>
          task.id === taskId
            ? {
                ...task,
                ...patch,
              }
            : task,
        ),
      );
    },
    [],
  );

  const handleTaskAction = useCallback(
    (action: TaskActionId, task: BackupTask) => {
      if (action === "cancel") {
        setCancelTask(task);
        return;
      }

      if (
        action === "view-detail" ||
        action === "view-log" ||
        action === "view-report" ||
        action === "view-issues"
      ) {
        openDetail(task);
        void onTaskAction?.(action, task.id);
        return;
      }

      if (action === "delete-record") {
        setLocalTasks((current) =>
          current.filter((currentTask) => currentTask.id !== task.id),
        );
        void onTaskAction?.(action, task.id);
        return;
      }

      applyTaskPatch(task.id, getOptimisticPatch(action, task));
      void onTaskAction?.(action, task.id);
    },
    [applyTaskPatch, onTaskAction, openDetail],
  );

  const confirmCancel = useCallback(() => {
    if (!cancelTask) {
      return;
    }

    applyTaskPatch(cancelTask.id, {
      status: "cancelled",
      currentStep: "已取消",
      completedAt: new Date(),
    });
    void onTaskAction?.("cancel", cancelTask.id);
    setCancelTask(null);
  }, [applyTaskPatch, cancelTask, onTaskAction]);

  return (
    <VStack gap={5} className={sx(taskStyles.page)} aria-busy={isLoading}>
      <HStack gap={3} vAlign="center" className={sx(taskStyles.header)}>
        <VStack gap={1} className={sx(taskStyles.title)}>
          <Text weight="bold">备份任务</Text>
          <Text type="supporting" color="secondary">
            查看备份、导入、导出和恢复任务的实时状态。
          </Text>
        </VStack>
        <Button
          label="立即备份"
          variant="primary"
          size="sm"
          onClick={() => {
            void onCreateBackup?.();
          }}
        />
      </HStack>

      {normalizedQuery ? (
        <VStack className={sx(taskStyles.notice)}>
          <Text type="supporting" color="secondary">
            当前页正在筛选「{query}」。
          </Text>
        </VStack>
      ) : null}

      <TaskSummary counts={summarizeTasks(localTasks)} />
      <TaskBoard
        tasks={visibleTasks}
        onAction={handleTaskAction}
        onCreateBackup={() => {
          void onCreateBackup?.();
        }}
      />

      <ConfirmDialog
        isOpen={cancelTask !== null}
        isInline
        title="取消任务？"
        description={CANCEL_CONFIRM_TEXT}
        confirmLabel="取消任务"
        cancelLabel="继续等待"
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setCancelTask(null);
          }
        }}
        onConfirm={confirmCancel}
      />

      <TaskDetailDrawer
        task={detailTask}
        logs={detailTask ? (localLogsByTaskId[detailTask.id] ?? []) : []}
        isOpen={detailTask !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setDetailTaskId(null);
          }
        }}
      />
    </VStack>
  );
}

function getOptimisticPatch(
  action: TaskActionId,
  task: BackupTask,
): Partial<BackupTask> {
  switch (action) {
    case "start":
      return {
        status: "scanning",
        currentStep: "正在查找聊天记录",
        progress: Math.max(task.progress ?? 0, 1),
      };
    case "pause":
      return {
        status: "paused",
        currentStep: "已暂停，已完成部分会保留",
      };
    case "resume":
      return {
        status: "backing-up",
        currentStep: "正在备份聊天记录",
      };
    case "retry":
      return {
        status: "waiting",
        currentStep: "等待重试",
        progress: 0,
        errorCount: 0,
        warningCount: 0,
        completedAt: null,
      };
    default:
      return {
        status: task.status as TaskStatus,
      };
  }
}
