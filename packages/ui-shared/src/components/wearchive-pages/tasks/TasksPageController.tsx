import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getApiAdapter, useBackupTasks } from "../../../hooks";
import { TasksPage } from "./TasksPage";
import type { TaskActionId } from "./tasksModel";

export interface TasksPageControllerProps {
  query?: string;
  onBackupCreated?: () => void;
}

export function TasksPageController({
  query,
  onBackupCreated,
}: TasksPageControllerProps) {
  const queryClient = useQueryClient();
  const tasksQuery = useBackupTasks();
  const createMutation = useMutation({
    mutationFn: () => getApiAdapter().tasks.create(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backupTasks"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });
      onBackupCreated?.();
    },
  });
  const actionMutation = useMutation({
    mutationFn: async ({
      action,
      taskId,
    }: {
      action: TaskActionId;
      taskId: number;
    }) => {
      const api = getApiAdapter();

      if (action === "pause") {
        return api.tasks.pause(taskId);
      }

      if (action === "start") {
        return api.tasks.start(taskId);
      }

      if (action === "resume") {
        return api.tasks.resume(taskId);
      }

      if (action === "cancel") {
        return api.tasks.cancel(taskId);
      }

      if (action === "retry") {
        return api.tasks.retry(taskId);
      }

      return null;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["backupTasks"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
  });

  return (
    <TasksPage
      tasks={tasksQuery.data ?? []}
      query={query ?? ""}
      isLoading={tasksQuery.isLoading}
      onCreateBackup={() => createMutation.mutateAsync().then(() => undefined)}
      onTaskAction={(action, taskId) =>
        actionMutation.mutateAsync({ action, taskId }).then(() => undefined)
      }
      onLoadTaskLogs={(taskId) => getApiAdapter().tasks.listLogs({ taskId })}
    />
  );
}
