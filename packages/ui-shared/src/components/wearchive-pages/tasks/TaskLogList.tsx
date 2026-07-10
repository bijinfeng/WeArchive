import { List, ListItem } from "@astryxdesign/core/List";
import { Text } from "@astryxdesign/core/Text";
import { Token } from "@astryxdesign/core/Token";
import type { TaskLog } from "@we-archive/core/types";

import { sx, taskStyles } from "./styles";

export type TaskLogFilter = "all" | TaskLog["level"];

export interface TaskLogListProps {
  logs: TaskLog[];
  filter: TaskLogFilter;
}

export function TaskLogList({ logs, filter }: TaskLogListProps) {
  const filteredLogs =
    filter === "all" ? logs : logs.filter((log) => log.level === filter);

  if (filteredLogs.length === 0) {
    return (
      <Text type="supporting" color="secondary">
        当前筛选下没有日志。
      </Text>
    );
  }

  return (
    <List density="compact" hasDividers>
      {filteredLogs.map((log, index) => (
        <ListItem
          key={`${log.id}-${index}`}
          className={sx(taskStyles.logRow)}
          startContent={
            <Token
              label={getLogLevelLabel(log.level)}
              color={getLogLevelColor(log.level)}
              size="sm"
            />
          }
          label={log.message}
          description={formatLogTime(log.createdAt)}
        />
      ))}
    </List>
  );
}

function getLogLevelLabel(level: TaskLog["level"]) {
  if (level === "error") {
    return "错误";
  }

  if (level === "warn") {
    return "警告";
  }

  return "信息";
}

function getLogLevelColor(level: TaskLog["level"]) {
  if (level === "error") {
    return "red";
  }

  if (level === "warn") {
    return "orange";
  }

  return "blue";
}

function formatLogTime(date: Date) {
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
