import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { HStack, Stack, VStack } from "@astryxdesign/core/Stack";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Text } from "@astryxdesign/core/Text";
import { Token } from "@astryxdesign/core/Token";
import type {
  WeArchiveArchiveStatus,
  WeArchiveIssue,
  WeArchiveOverviewAccount,
  WeArchiveOverviewStats,
  WeArchiveOverviewTask,
  WeArchiveViewId,
} from "@we-archive/core/types";
import { formatNumber } from "@we-archive/core/utils";
import {
  Archive,
  CheckCircle2,
  Clock3,
  Database,
  FileArchive,
  HardDrive,
  Import,
  type LucideIcon,
  MessageCircle,
  RotateCcw,
  SearchCheck,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { buildHomeData, HomePage } from "../wearchive-pages/home";
import { RecordsPageController } from "../wearchive-pages/records";
import { RestorePageController } from "../wearchive-pages/restore";
import { SettingsPageController } from "../wearchive-pages/settings";
import { TasksPageController } from "../wearchive-pages/tasks";
import { TransferPageController } from "../wearchive-pages/transfer";
import { VIEW_TITLES } from "./constants";
import { getSearchTargetProps } from "./searchTargets";
import { styles, sx } from "./styles";
import { formatStorage, getViewSubtitle } from "./utils";

interface WeArchivePageSlotProps {
  activeView: WeArchiveViewId;
  account: WeArchiveOverviewAccount | null;
  archiveStatus?: WeArchiveArchiveStatus | undefined;
  issues?: WeArchiveIssue[] | undefined;
  stats: WeArchiveOverviewStats;
  tasks: WeArchiveOverviewTask[];
  query: string;
  isLoading: boolean;
  error: string | null;
  platformLabel: string;
  onBackupAction: () => void;
  onNavigate: (viewId: WeArchiveViewId) => void;
}

type PageRow = {
  icon: LucideIcon;
  title: string;
  description: string;
  tone: "green" | "blue" | "orange" | "red" | "gray";
  statusLabel: string;
};

const PAGE_ROWS: Record<Exclude<WeArchiveViewId, "overview">, PageRow[]> = {
  records: [
    {
      icon: MessageCircle,
      title: "会话列表",
      description: "按联系人、群聊、附件和备份状态筛选",
      tone: "green",
      statusLabel: "可用",
    },
    {
      icon: SearchCheck,
      title: "消息流",
      description: "命中关键词后保留上下文并支持跳转",
      tone: "blue",
      statusLabel: "索引",
    },
    {
      icon: FileArchive,
      title: "批量导出",
      description: "选中会话后交给导入导出工作台处理",
      tone: "orange",
      statusLabel: "预览",
    },
  ],
  backup: [
    {
      icon: Clock3,
      title: "任务队列",
      description: "暂停、继续、取消、重试都写回核心任务仓库",
      tone: "blue",
      statusLabel: "队列",
    },
    {
      icon: ShieldAlert,
      title: "异常日志",
      description: "失败和警告保留日志，可按等级过滤",
      tone: "orange",
      statusLabel: "需确认",
    },
    {
      icon: CheckCircle2,
      title: "增量进度",
      description: "已处理消息和附件不会因为中断丢失",
      tone: "green",
      statusLabel: "可恢复",
    },
  ],
  transfer: [
    {
      icon: Import,
      title: "导入旧备份",
      description: "先检查 Archive v0，再展示账号、消息和附件预览",
      tone: "green",
      statusLabel: "可用",
    },
    {
      icon: FileArchive,
      title: "导出迁移包",
      description: "支持 HTML、CSV、JSON 的 MVP 预估和任务创建",
      tone: "blue",
      statusLabel: "规划中",
    },
    {
      icon: ShieldAlert,
      title: "风险预览",
      description: "执行前展示缺失附件、未知消息和重复数据",
      tone: "orange",
      statusLabel: "需确认",
    },
  ],
  restore: [
    {
      icon: RotateCcw,
      title: "恢复点检查",
      description: "列出可用恢复点，并验证目标账号和数据完整度",
      tone: "green",
      statusLabel: "可检查",
    },
    {
      icon: ShieldAlert,
      title: "恢复策略预览",
      description: "MVP 只允许检查和预览，破坏性执行保持禁用",
      tone: "orange",
      statusLabel: "受限",
    },
    {
      icon: Archive,
      title: "生成新归档",
      description: "后续恢复执行会优先写入新归档，避免覆盖原数据",
      tone: "blue",
      statusLabel: "方案",
    },
  ],
  settings: [
    {
      icon: HardDrive,
      title: "存储路径",
      description: "检查读写权限、空间和默认导入导出目录",
      tone: "green",
      statusLabel: "可检查",
    },
    {
      icon: ShieldAlert,
      title: "安全默认值",
      description: "导出加密、敏感信息隐藏和操作日志保留策略",
      tone: "orange",
      statusLabel: "需确认",
    },
    {
      icon: Settings,
      title: "外观与通知",
      description: "桌面和 fnOS 共享同一套主题与提醒行为",
      tone: "blue",
      statusLabel: "共享",
    },
  ],
};

export function WeArchivePageSlot(props: WeArchivePageSlotProps) {
  if (props.activeView === "overview") {
    return (
      <HomePage
        data={buildHomeData({
          account: props.account,
          stats: props.stats,
          tasks: props.tasks,
          issues: props.issues,
          archiveStatus: props.archiveStatus,
          error: props.error,
        })}
        platformLabel={props.platformLabel}
        query={props.query}
        isLoading={props.isLoading}
        onBackupAction={props.onBackupAction}
        onNavigate={(viewId) => props.onNavigate(viewId)}
      />
    );
  }

  if (props.activeView === "records") {
    return (
      <RecordsPageController
        query={props.query}
        onNavigate={(viewId) => props.onNavigate(viewId)}
      />
    );
  }

  if (props.activeView === "backup") {
    return (
      <TasksPageController
        query={props.query}
        onBackupCreated={() => props.onNavigate("backup")}
      />
    );
  }

  if (props.activeView === "transfer") {
    return <TransferPageController query={props.query} />;
  }

  if (props.activeView === "restore") {
    return <RestorePageController query={props.query} />;
  }

  if (props.activeView === "settings") {
    return <SettingsPageController query={props.query} />;
  }

  return <WorkbenchPage {...props} activeView={props.activeView} />;
}

export function getPageSearchResultCount(
  activeView: WeArchiveViewId,
  query: string,
  account: WeArchiveOverviewAccount | null,
  tasks: WeArchiveOverviewTask[],
) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return null;
  }

  const baseTerms = [
    VIEW_TITLES[activeView],
    account?.nickname,
    account?.wxid,
    ...tasks.flatMap((task) => [
      String(task.id),
      task.status,
      task.currentStep,
      task.savePath,
    ]),
  ];
  const rowTerms =
    activeView === "overview"
      ? ["数据概览", "当前账号", "最近任务", "聊天会话", "消息数量"]
      : PAGE_ROWS[activeView].flatMap((row) => [row.title, row.description]);

  return [...baseTerms, ...rowTerms].filter((term) =>
    String(term ?? "")
      .toLowerCase()
      .includes(normalizedQuery),
  ).length;
}

function WorkbenchPage({
  activeView,
  account,
  stats,
  tasks,
  query,
  isLoading,
  error,
  platformLabel,
}: WeArchivePageSlotProps & {
  activeView: Exclude<WeArchiveViewId, "overview">;
}) {
  const rows = PAGE_ROWS[activeView];

  return (
    <VStack gap={5} className={sx(styles.content)}>
      <HStack gap={3} vAlign="center" className={sx(styles.contentHeader)}>
        <VStack gap={1} className={sx(styles.contentTitle)}>
          <Text weight="bold">{VIEW_TITLES[activeView]}</Text>
          <Text type="supporting" color="secondary">
            {getViewSubtitle(activeView, account, platformLabel)}
          </Text>
        </VStack>
        <Token
          label={isLoading ? "同步中" : error ? "离线" : "可用"}
          color={error ? "red" : "green"}
          size="sm"
        />
      </HStack>

      {query ? (
        <Stack className={sx(styles.notice)} padding={4}>
          <Text type="supporting" color="secondary">
            当前页正在筛选「{query}」，按 Esc 可清空，Enter 会定位首个命中项。
          </Text>
        </Stack>
      ) : null}

      <HStack gap={3} className={sx(styles.metricGrid)}>
        <MetricCard
          icon={MessageCircle}
          label="会话"
          value={formatNumber(stats.conversationCount)}
        />
        <MetricCard
          icon={Database}
          label="消息"
          value={formatNumber(stats.messageCount)}
        />
        <MetricCard
          icon={Archive}
          label="附件"
          value={formatNumber(stats.attachmentCount)}
        />
        <MetricCard
          icon={HardDrive}
          label="占用"
          value={formatStorage(stats.storageSize)}
        />
      </HStack>

      <HStack gap={3} className={sx(styles.workspace)}>
        <VStack gap={3} className={sx(styles.panel)}>
          <Text weight="bold">MVP 工作台</Text>
          <VStack gap={1}>
            {rows.map((row) => (
              <FeatureRow key={row.title} row={row} />
            ))}
          </VStack>
        </VStack>

        <VStack gap={3} className={sx(styles.panel)}>
          <HStack gap={2} vAlign="center">
            <StatusDot
              variant={error ? "error" : "success"}
              label={error ? "异常" : "正常"}
            />
            <Text weight="bold">当前上下文</Text>
          </HStack>
          <ContextRow label="账号" value={account?.nickname ?? "暂无账号"} />
          <ContextRow
            label="最近任务"
            value={tasks[0]?.currentStep ?? "暂无任务"}
          />
          <ContextRow label="平台" value={platformLabel} />
          <Button
            label={activeView === "restore" ? "查看恢复限制" : "继续完善页面"}
            variant={activeView === "restore" ? "secondary" : "primary"}
            size="sm"
            isDisabled={activeView !== "restore"}
            tooltip="后续任务会按 PRD 继续补齐完整交互"
          />
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
    <VStack
      gap={3}
      className={sx(styles.metricCard, styles.searchTarget)}
      {...getSearchTargetProps(`${label} ${value}`)}
    >
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

function FeatureRow({ row }: { row: PageRow }) {
  return (
    <HStack
      gap={3}
      vAlign="center"
      className={sx(styles.taskRow, styles.searchTarget)}
      {...getSearchTargetProps(`${row.title} ${row.description}`)}
    >
      <Icon icon={row.icon} size="sm" />
      <VStack gap={0}>
        <Text>{row.title}</Text>
        <Text type="supporting" color="secondary">
          {row.description}
        </Text>
      </VStack>
      <Token label={row.statusLabel} color={row.tone} size="sm" />
    </HStack>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <HStack
      gap={2}
      vAlign="center"
      className={sx(styles.taskRow, styles.searchTarget)}
      {...getSearchTargetProps(`${label} ${value}`)}
    >
      <Text type="supporting" color="secondary">
        {label}
      </Text>
      <Text>{value}</Text>
    </HStack>
  );
}
