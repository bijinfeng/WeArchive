import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Token } from "@astryxdesign/core/Token";
import type { WeArchiveHomeData } from "@we-archive/core/types";
import { formatDate } from "date-fns";

import type { HomeNavigationIntent, HomeSummaryState } from "./homeModel";
import { getHomeSummaryState, getIssueCount } from "./homeModel";
import { homeStyles, sx } from "./styles";

export interface HomeStatusSummaryProps {
  data: WeArchiveHomeData;
  onBackupAction?: (() => void | Promise<void>) | undefined;
  onNavigate?:
    | ((viewId: "backup" | "transfer", intent?: HomeNavigationIntent) => void)
    | undefined;
}

export function HomeStatusSummary({
  data,
  onBackupAction,
  onNavigate,
}: HomeStatusSummaryProps) {
  const state = getHomeSummaryState(data);
  const copy = getSummaryCopy(state, data);

  return (
    <Card
      padding={5}
      role="region"
      aria-label="顶部状态摘要"
      className={sx(homeStyles.summaryHero)}
    >
      <VStack gap={3}>
        <Text type="supporting" color="accent" weight="bold">
          顶部状态摘要
        </Text>
        <VStack gap={2}>
          <Text weight="bold">{copy.title}</Text>
          <Text type="supporting" color="secondary">
            {copy.description}
          </Text>
        </VStack>
        <HStack gap={2} className={sx(homeStyles.summaryMeta)}>
          <Token
            label={`最近备份：${formatNullableDate(data.account?.lastBackupAt)}`}
            color="gray"
            size="sm"
          />
          <Token
            label={`数据完整度：${data.archiveStatus.health === "ready" ? "100%" : data.archiveStatus.health === "empty" ? "未建立" : "需检查"}`}
            color={
              data.archiveStatus.health === "attention" ? "orange" : "green"
            }
            size="sm"
          />
          <Token
            label={`待处理问题：${getIssueCount(data)}`}
            color={getIssueCount(data) > 0 ? "orange" : "green"}
            size="sm"
          />
        </HStack>
      </VStack>

      <HStack gap={2} className={sx(homeStyles.summaryActions)}>
        <Button
          label={copy.primaryLabel}
          variant="primary"
          onClick={() => {
            if (state === "attention") {
              onNavigate?.("backup", { source: "home-summary" });
              return;
            }

            void onBackupAction?.();
          }}
        />
        <Button
          label={copy.secondaryLabel}
          variant="secondary"
          onClick={() => {
            onNavigate?.(state === "first-use" ? "transfer" : "backup", {
              source: "home-summary",
            });
          }}
        />
      </HStack>
    </Card>
  );
}

function getSummaryCopy(state: HomeSummaryState, data: WeArchiveHomeData) {
  if (state === "first-use") {
    return {
      title: "还没有备份微信聊天记录",
      description: "请先选择微信账号并开始第一次备份。",
      primaryLabel: "开始第一次备份",
      secondaryLabel: "了解会备份哪些内容",
    };
  }

  if (state === "attention") {
    return {
      title: `有 ${getIssueCount(data)} 个问题需要处理`,
      description: "部分附件没有备份成功，建议重新检查。",
      primaryLabel: "查看问题",
      secondaryLabel: "稍后处理",
    };
  }

  return {
    title: "备份状态正常",
    description: "最近一次备份已完成，当前没有需要处理的问题。",
    primaryLabel: "立即备份",
    secondaryLabel: "查看备份记录",
  };
}

function formatNullableDate(value: Date | string | null | undefined) {
  if (!value) {
    return "暂无";
  }

  return formatDate(new Date(value), "MM-dd HH:mm");
}
