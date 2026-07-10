import { List } from "@astryxdesign/core/List";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import type { BackupTask } from "@we-archive/core/types";

import { EmptyAction } from "../../wearchive-feedback";
import { sx, taskStyles } from "./styles";
import { TaskRow } from "./TaskRow";
import type { TaskActionId } from "./tasksModel";

export interface TaskBoardProps {
  tasks: BackupTask[];
  onAction: (action: TaskActionId, task: BackupTask) => void;
  onCreateBackup?: () => void;
}

export function TaskBoard({ tasks, onAction, onCreateBackup }: TaskBoardProps) {
  return (
    <VStack gap={0} className={sx(taskStyles.board)}>
      <HStack gap={3} vAlign="center" className={sx(taskStyles.boardHeader)}>
        <VStack gap={1}>
          <Text weight="bold">任务队列</Text>
          <Text type="supporting" color="secondary">
            暂停、继续、取消和重试都会保留当前页面状态。
          </Text>
        </VStack>
      </HStack>

      {tasks.length > 0 ? (
        <List density="compact" hasDividers>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} onAction={onAction} />
          ))}
        </List>
      ) : (
        <VStack className={sx(taskStyles.empty)}>
          <EmptyAction
            title="当前没有任务"
            description="创建一次备份后会显示实时状态、日志和处理结果。"
            actionLabel="立即备份"
            onAction={() => onCreateBackup?.()}
          />
        </VStack>
      )}
    </VStack>
  );
}
