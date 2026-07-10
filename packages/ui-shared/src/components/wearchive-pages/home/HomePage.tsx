import { Card } from "@astryxdesign/core/Card";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";

import { AccountConsole } from "./AccountConsole";
import { DataKpiGrid } from "./DataKpiGrid";
import { HomeStatusSummary } from "./HomeStatusSummary";
import type { HomePageProps } from "./homeModel";
import { IssueList } from "./IssueList";
import { QuickActions } from "./QuickActions";
import { RecentTaskList } from "./RecentTaskList";
import { homeStyles, sx } from "./styles";

export function HomePage({
  data,
  platformLabel,
  isLoading = false,
  onNavigate,
  onBackupAction,
}: HomePageProps) {
  if (isLoading) {
    return <HomePageSkeleton />;
  }

  return (
    <VStack gap={5} className={sx(homeStyles.page)}>
      <HStack gap={3} vAlign="center" className={sx(homeStyles.header)}>
        <VStack gap={1} className={sx(homeStyles.headerTitle)}>
          <Text weight="bold">数据概览</Text>
          <Text type="supporting" color="secondary">
            {data.account?.nickname
              ? `${data.account.nickname} 的备份状态`
              : "开始第一次备份后会显示账号和归档状态"}
          </Text>
        </VStack>
      </HStack>

      <HomeStatusSummary
        data={data}
        onBackupAction={onBackupAction}
        onNavigate={onNavigate}
      />

      <AccountConsole
        data={data}
        platformLabel={platformLabel}
        onBackupAction={onBackupAction}
      />

      <DataKpiGrid stats={data.stats} onNavigate={onNavigate} />

      <section className={sx(homeStyles.homeGrid)}>
        <VStack gap={4}>
          <RecentTaskList
            tasks={data.tasks}
            onBackupAction={onBackupAction}
            onNavigate={onNavigate}
          />
          <IssueList issues={data.issues} onNavigate={onNavigate} />
        </VStack>
        <QuickActions onNavigate={onNavigate} />
      </section>
    </VStack>
  );
}

function HomePageSkeleton() {
  return (
    <VStack gap={5} className={sx(homeStyles.page)} aria-busy>
      <Card padding={5}>
        <VStack gap={3}>
          <Skeleton width="42%" height={28} />
          <Skeleton width="70%" height={16} index={1} />
          <Skeleton width="50%" height={24} radius={2} index={2} />
        </VStack>
      </Card>
      <Card padding={5}>
        <VStack gap={4}>
          <Skeleton width="34%" height={24} />
          <Skeleton width="100%" height={96} index={1} />
          <Skeleton width="100%" height={64} index={2} />
        </VStack>
      </Card>
      <HStack gap={3}>
        <Skeleton width="100%" height={112} index={3} />
        <Skeleton width="100%" height={112} index={4} />
        <Skeleton width="100%" height={112} index={5} />
      </HStack>
    </VStack>
  );
}
