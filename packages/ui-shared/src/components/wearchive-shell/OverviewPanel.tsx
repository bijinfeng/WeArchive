import { Icon } from "@astryxdesign/core/Icon";
import { HStack, Stack, VStack } from "@astryxdesign/core/Stack";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Text } from "@astryxdesign/core/Text";
import { Token } from "@astryxdesign/core/Token";
import type {
  WeArchiveOverviewAccount,
  WeArchiveOverviewStats,
  WeArchiveOverviewTask,
  WeArchiveViewId,
} from "@we-archive/core/types";
import { formatNumber } from "@we-archive/core/utils";
import {
  Archive,
  Database,
  HardDrive,
  type LucideIcon,
  MessageCircle,
  RotateCcw,
  UserRound,
} from "lucide-react";

import { VIEW_TITLES } from "./constants";
import { styles, sx } from "./styles";
import { formatStorage, getViewSubtitle } from "./utils";

interface OverviewPanelProps {
  activeView: WeArchiveViewId;
  account: WeArchiveOverviewAccount | null;
  stats: WeArchiveOverviewStats;
  tasks: WeArchiveOverviewTask[];
  isLoading: boolean;
  error: string | null;
  platformLabel: string;
}

export function OverviewPanel({
  activeView,
  account,
  stats,
  tasks,
  isLoading,
  error,
  platformLabel,
}: OverviewPanelProps) {
  return (
    <VStack gap={5} className={sx(styles.content)}>
      <HStack gap={3} vAlign="center" className={sx(styles.contentHeader)}>
        <VStack gap={1} className={sx(styles.contentTitle)}>
          <Text weight="bold" maxLines={1}>
            {VIEW_TITLES[activeView]}
          </Text>
          <Text type="supporting" color="secondary" maxLines={2}>
            {getViewSubtitle(activeView, account, platformLabel)}
          </Text>
        </VStack>
        <Token
          label={isLoading ? "同步中" : error ? "离线" : "在线"}
          color={error ? "red" : "green"}
          size="sm"
        />
      </HStack>

      {error ? (
        <Stack className={sx(styles.notice)} padding={4}>
          <Text type="supporting" color="secondary">
            {error}
          </Text>
        </Stack>
      ) : null}

      <HStack gap={3} className={sx(styles.metricGrid)}>
        <MetricCard
          icon={MessageCircle}
          label="聊天会话"
          value={formatNumber(stats.conversationCount)}
        />
        <MetricCard
          icon={Database}
          label="消息数量"
          value={formatNumber(stats.messageCount)}
        />
        <MetricCard
          icon={Archive}
          label="附件数量"
          value={formatNumber(stats.attachmentCount)}
        />
        <MetricCard
          icon={HardDrive}
          label="存储占用"
          value={formatStorage(stats.storageSize)}
        />
      </HStack>

      <HStack gap={3} className={sx(styles.workspace)}>
        <VStack gap={3} className={sx(styles.panel)}>
          <HStack gap={2} vAlign="center">
            <Icon icon={UserRound} size="sm" />
            <Text weight="bold">当前账号</Text>
          </HStack>
          <VStack gap={1}>
            <Text>{account?.nickname ?? "等待导入微信账号"}</Text>
            <Text type="supporting" color="secondary">
              {account?.wxid ?? "完成首次备份后会显示账号信息"}
            </Text>
          </VStack>
        </VStack>

        <VStack gap={3} className={sx(styles.panel)}>
          <HStack gap={2} vAlign="center">
            <Icon icon={RotateCcw} size="sm" />
            <Text weight="bold">最近任务</Text>
          </HStack>
          <VStack gap={2}>
            {tasks.length > 0 ? (
              tasks
                .slice(0, 3)
                .map((task) => <TaskRow key={task.id} task={task} />)
            ) : (
              <Text type="supporting" color="secondary">
                暂无备份任务
              </Text>
            )}
          </VStack>
        </VStack>
      </HStack>
    </VStack>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <VStack gap={3} className={sx(styles.metricCard)}>
      <Icon icon={icon} size="sm" />
      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          {label}
        </Text>
        <Text weight="bold">{value}</Text>
      </VStack>
    </VStack>
  );
}

function TaskRow({ task }: { task: WeArchiveOverviewTask }) {
  return (
    <HStack gap={2} vAlign="center" className={sx(styles.taskRow)}>
      <StatusDot
        variant={task.status === "failed" ? "error" : "success"}
        label={task.status ?? "waiting"}
      />
      <VStack gap={0}>
        <Text maxLines={1}>任务 #{task.id}</Text>
        <Text type="supporting" color="secondary" maxLines={1}>
          {task.currentStep ?? `进度 ${task.progress ?? 0}%`}
        </Text>
      </VStack>
    </HStack>
  );
}
