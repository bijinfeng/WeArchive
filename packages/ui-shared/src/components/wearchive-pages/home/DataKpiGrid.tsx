import { Card } from "@astryxdesign/core/Card";
import { Icon } from "@astryxdesign/core/Icon";
import { VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import type {
  WeArchiveOverviewStats,
  WeArchiveViewId,
} from "@we-archive/core/types";
import { formatNumber } from "@we-archive/core/utils";
import {
  Archive,
  Database,
  HardDrive,
  type LucideIcon,
  MessageCircle,
  PlusCircle,
  ShieldAlert,
} from "lucide-react";

import { getSearchTargetProps } from "../../wearchive-shell/searchTargets";
import { formatStorage } from "../../wearchive-shell/utils";
import type { HomeNavigationIntent } from "./homeModel";
import { homeStyles, sx } from "./styles";

interface KpiItem {
  icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
  targetView: WeArchiveViewId;
  metric: string;
}

export interface DataKpiGridProps {
  stats: WeArchiveOverviewStats;
  onNavigate?:
    | ((viewId: WeArchiveViewId, intent?: HomeNavigationIntent) => void)
    | undefined;
}

export function DataKpiGrid({ stats, onNavigate }: DataKpiGridProps) {
  const items: KpiItem[] = [
    {
      icon: MessageCircle,
      label: "已备份会话",
      value: formatNumber(stats.conversationCount),
      helper: "全部可查看",
      targetView: "records",
      metric: "conversations",
    },
    {
      icon: Database,
      label: "消息数量",
      value: formatNumber(stats.messageCount),
      helper: `${formatNumber(stats.todayNewCount)} 条今日新增`,
      targetView: "records",
      metric: "messages",
    },
    {
      icon: Archive,
      label: "附件数量",
      value: formatNumber(stats.attachmentCount),
      helper: "图片、视频、文件、语音",
      targetView: "records",
      metric: "attachments",
    },
    {
      icon: HardDrive,
      label: "当前占用空间",
      value: formatStorage(stats.storageSize),
      helper: "查看归档位置",
      targetView: "settings",
      metric: "storage",
    },
    {
      icon: PlusCircle,
      label: "今日新增",
      value: formatNumber(stats.todayNewCount),
      helper: "按最近时间查看",
      targetView: "records",
      metric: "today",
    },
    {
      icon: ShieldAlert,
      label: "待处理问题",
      value: formatNumber(stats.pendingIssues),
      helper: stats.pendingIssues > 0 ? "建议先处理" : "当前无待办",
      targetView: "backup",
      metric: "issues",
    },
  ];

  return (
    <Card padding={4} variant="transparent" role="region" aria-label="数据概览">
      <VStack gap={3}>
        <Text weight="bold">数据概览</Text>
        <section className={sx(homeStyles.kpiGrid)}>
          {items.map((item) => (
            <button
              key={item.metric}
              type="button"
              aria-label={`${item.label} ${item.value}，${item.helper}`}
              className={sx(homeStyles.kpiButton)}
              onClick={() =>
                onNavigate?.(item.targetView, {
                  source: "home-kpi",
                  metric: item.metric,
                })
              }
              {...getSearchTargetProps(
                `${item.label} ${item.value} ${item.helper}`,
                { preserveTabIndex: true },
              )}
            >
              <Card padding={4} height="100%">
                <VStack gap={3}>
                  <Icon icon={item.icon} size="sm" />
                  <VStack gap={1}>
                    <Text type="supporting" color="secondary">
                      {item.label}
                    </Text>
                    <Text weight="bold">{item.value}</Text>
                    <Text type="supporting" color="accent">
                      {item.helper}
                    </Text>
                  </VStack>
                </VStack>
              </Card>
            </button>
          ))}
        </section>
      </VStack>
    </Card>
  );
}
