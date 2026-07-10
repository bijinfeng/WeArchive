import { Card } from "@astryxdesign/core/Card";
import { Icon } from "@astryxdesign/core/Icon";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Clock3, ListChecks, PauseCircle, TriangleAlert } from "lucide-react";
import { sx, taskStyles } from "./styles";
import type { TaskSummaryCounts } from "./tasksModel";

export interface TaskSummaryProps {
  counts: TaskSummaryCounts;
}

export function TaskSummary({ counts }: TaskSummaryProps) {
  return (
    <section className={sx(taskStyles.summaryGrid)} aria-label="任务概览">
      <SummaryCard label="进行中" value={counts.inProgress} icon={ListChecks} />
      <SummaryCard label="等待开始" value={counts.waiting} icon={Clock3} />
      <SummaryCard label="已暂停" value={counts.paused} icon={PauseCircle} />
      <SummaryCard
        label="需处理"
        value={counts.needsAttention}
        icon={TriangleAlert}
      />
    </section>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: typeof ListChecks;
}) {
  return (
    <Card padding={4} className={sx(taskStyles.summaryCard)}>
      <HStack gap={3} vAlign="center">
        <Icon icon={icon} size="sm" />
        <VStack gap={0}>
          <Text type="supporting" color="secondary">
            {label}
          </Text>
          <Text weight="bold">{value.toLocaleString("zh-CN")}</Text>
        </VStack>
      </HStack>
    </Card>
  );
}
