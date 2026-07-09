import { AppShell as AstryxAppShell } from "@astryxdesign/core/AppShell";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { Layout, LayoutContent } from "@astryxdesign/core/Layout";
import { NavIcon } from "@astryxdesign/core/NavIcon";
import {
  SideNav,
  SideNavCollapseButton,
  SideNavHeading,
  type SideNavImperativeCollapseHandle,
  SideNavItem,
  SideNavSection,
} from "@astryxdesign/core/SideNav";
import { HStack, Stack, VStack } from "@astryxdesign/core/Stack";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Token } from "@astryxdesign/core/Token";
import { TopNav } from "@astryxdesign/core/TopNav";
import type {
  CompiledStyles,
  InlineStyles,
  StyleXArray,
} from "@stylexjs/stylex";
import * as stylex from "@stylexjs/stylex";
import type {
  WeArchiveOverviewAccount,
  WeArchiveOverviewStats,
  WeArchiveOverviewTask,
  WeArchiveViewId,
} from "@we-archive/core/types";
import { formatFileSize, formatNumber } from "@we-archive/core/utils";
import {
  Archive,
  ArrowDownUp,
  Database,
  FolderArchive,
  HardDrive,
  Home,
  type LucideIcon,
  Maximize2,
  Menu,
  MessageCircle,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

export type WeArchiveRuntimePlatform =
  | "darwin"
  | "win32"
  | "linux"
  | "web"
  | "fnos";

export interface WeArchiveWindowControls {
  minimize?: () => void;
  toggleMaximize?: () => void;
  close?: () => void;
}

export interface WeArchiveShellProps {
  account?: WeArchiveOverviewAccount | null;
  stats: WeArchiveOverviewStats;
  tasks?: WeArchiveOverviewTask[];
  isLoading?: boolean;
  error?: string | null;
  activeView?: WeArchiveViewId;
  defaultActiveView?: WeArchiveViewId;
  platformLabel?: string;
  chrome?: "embedded" | "desktop";
  runtimePlatform?: WeArchiveRuntimePlatform;
  windowControls?: WeArchiveWindowControls;
  onActiveViewChange?: (viewId: WeArchiveViewId) => void;
  onBackupAction?: () => void | Promise<void>;
}

type NavItem = {
  id: WeArchiveViewId;
  label: string;
  icon: LucideIcon;
  count?: number;
};

const NAV_SECTIONS: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "概览",
    items: [{ id: "overview", label: "首页", icon: Home }],
  },
  {
    title: "数据管理",
    items: [
      { id: "records", label: "聊天记录", icon: MessageCircle },
      { id: "transfer", label: "导入导出", icon: ArrowDownUp },
    ],
  },
  {
    title: "备份",
    items: [{ id: "backup", label: "备份任务", icon: FolderArchive }],
  },
  {
    title: "系统",
    items: [{ id: "settings", label: "设置", icon: Settings }],
  },
];

const VIEW_TITLES: Record<WeArchiveViewId, string> = {
  overview: "数据概览",
  records: "聊天记录",
  backup: "备份任务",
  transfer: "导入导出",
  settings: "设置",
};

const VIEW_PLACEHOLDERS: Record<WeArchiveViewId, string> = {
  overview: "搜索账号、任务或异常",
  records: "搜索联系人、群聊、消息或文件",
  backup: "搜索任务、账号或保存位置",
  transfer: "搜索导入文件、导出任务",
  settings: "搜索设置项",
};

export function WeArchiveShell({
  account = null,
  stats,
  tasks = [],
  isLoading = false,
  error = null,
  activeView: controlledActiveView,
  defaultActiveView = "overview",
  platformLabel = "微信聊天记录备份",
  chrome = "embedded",
  runtimePlatform = "web",
  windowControls,
  onActiveViewChange,
  onBackupAction,
}: WeArchiveShellProps) {
  const sideNavHandleRef = useRef<SideNavImperativeCollapseHandle | null>(null);
  const [internalActiveView, setInternalActiveView] =
    useState<WeArchiveViewId>(defaultActiveView);
  const [query, setQuery] = useState("");
  const activeView = controlledActiveView ?? internalActiveView;
  const isDesktopChrome = chrome === "desktop";
  const isMacClient = isDesktopChrome && runtimePlatform === "darwin";
  const isWindowsClient = isDesktopChrome && runtimePlatform === "win32";
  const handleBackupAction = useCallback(() => {
    void onBackupAction?.();
  }, [onBackupAction]);

  const navSections = useMemo(
    () =>
      NAV_SECTIONS.map((section) => ({
        ...section,
        items: section.items.map((item) => {
          if (item.id === "records") {
            return { ...item, count: stats.conversationCount };
          }

          if (item.id === "backup") {
            return { ...item, count: tasks.length };
          }

          return item;
        }),
      })),
    [stats.conversationCount, tasks.length],
  );

  const setActiveView = useCallback(
    (viewId: WeArchiveViewId) => {
      if (!controlledActiveView) {
        setInternalActiveView(viewId);
      }

      onActiveViewChange?.(viewId);
    },
    [controlledActiveView, onActiveViewChange],
  );

  return (
    <Stack
      className={sx(
        styles.stage,
        isDesktopChrome ? styles.desktopStage : styles.embeddedStage,
      )}
      height="100%"
      padding={isDesktopChrome ? 6 : 0}
    >
      <Stack
        className={sx(styles.window, !isDesktopChrome && styles.embeddedWindow)}
        height="100%"
      >
        <AstryxAppShell
          className={sx(styles.shell)}
          contentPadding={0}
          height="fill"
          variant="section"
          mobileNav={{ breakpoint: "md" }}
          topNav={
            <TopNav
              className={sx(
                styles.topNav,
                isDesktopChrome && styles.desktopTopNav,
              )}
              label="WeArchive 主导航"
              heading={
                <HStack
                  gap={3}
                  vAlign="center"
                  className={sx(styles.titleStart)}
                >
                  {isMacClient ? (
                    <Stack
                      className={sx(styles.nativeTrafficSpace)}
                      aria-hidden
                    />
                  ) : null}
                  {isWindowsClient ? (
                    <Text type="supporting" weight="bold" maxLines={1}>
                      WeArchive {platformLabel}
                    </Text>
                  ) : (
                    <VStack gap={0}>
                      <Text weight="bold" maxLines={1}>
                        WeArchive
                      </Text>
                      <Text type="supporting" color="secondary" maxLines={1}>
                        {platformLabel}
                      </Text>
                    </VStack>
                  )}
                  <SideNavCollapseButton
                    handleRef={sideNavHandleRef}
                    label="折叠侧边栏"
                  >
                    <Icon icon={Menu} size="sm" />
                  </SideNavCollapseButton>
                </HStack>
              }
              centerContent={
                <HStack
                  gap={2}
                  vAlign="center"
                  className={sx(styles.searchCluster)}
                >
                  <TextInput
                    label="全局搜索"
                    isLabelHidden
                    size="sm"
                    width="min(38vw, calc(var(--spacing-12) * 10))"
                    startIcon={Search}
                    placeholder={VIEW_PLACEHOLDERS[activeView]}
                    value={query}
                    onChange={setQuery}
                    hasClear
                  />
                  <Token
                    label={query ? "找到 0 项" : "全部"}
                    color={query ? "green" : "gray"}
                    size="sm"
                  />
                </HStack>
              }
              endContent={
                <HStack
                  gap={2}
                  vAlign="center"
                  className={sx(styles.topActions)}
                >
                  <Button
                    className={sx(styles.backupAction)}
                    label="立即备份"
                    variant="primary"
                    size="md"
                    icon={<Icon icon={Plus} size="sm" />}
                    onClick={handleBackupAction}
                  />
                  {isWindowsClient ? (
                    <WindowsWindowControls controls={windowControls} />
                  ) : null}
                </HStack>
              }
            />
          }
          sideNav={
            <SideNav
              className={sx(styles.sideNav)}
              handleRef={sideNavHandleRef}
              collapsible={{
                buttonLabel: "折叠侧边栏",
                hasButton: false,
              }}
              header={
                <SideNavHeading
                  heading="WeArchive"
                  subheading="微信聊天记录备份"
                  icon={
                    <NavIcon
                      className={sx(styles.brandMark)}
                      icon={<Icon icon={ShieldCheck} size="sm" />}
                    />
                  }
                />
              }
              footer={
                <SideNavSection title="运行状态" isHeaderHidden>
                  <SideNavItem
                    label={error ? "服务异常" : "服务已连接"}
                    icon={HardDrive}
                    endContent={
                      <StatusDot
                        variant={error ? "error" : "success"}
                        label={error ? "异常" : "正常"}
                      />
                    }
                  />
                  <VStack gap={1} className={sx(styles.libraryMeta)}>
                    <Text type="supporting" maxLines={1}>
                      {account?.nickname ?? "暂无账号"}
                    </Text>
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {formatStorage(stats.storageSize)}
                    </Text>
                  </VStack>
                </SideNavSection>
              }
            >
              {navSections.map((section) => (
                <SideNavSection key={section.title} title={section.title}>
                  {section.items.map((item) => (
                    <SideNavItem
                      key={item.id}
                      label={item.label}
                      icon={item.icon}
                      isSelected={item.id === activeView}
                      onClick={() => setActiveView(item.id)}
                      endContent={
                        typeof item.count === "number" && item.count > 0 ? (
                          <Badge
                            label={item.count}
                            variant={
                              item.id === activeView ? "green" : "neutral"
                            }
                          />
                        ) : undefined
                      }
                    />
                  ))}
                </SideNavSection>
              ))}
            </SideNav>
          }
        >
          <Layout
            height="fill"
            content={
              <LayoutContent className={sx(styles.main)} padding={0}>
                <OverviewPanel
                  activeView={activeView}
                  account={account}
                  stats={stats}
                  tasks={tasks}
                  isLoading={isLoading}
                  error={error}
                  platformLabel={platformLabel}
                />
              </LayoutContent>
            }
          />
        </AstryxAppShell>
      </Stack>
    </Stack>
  );
}

function OverviewPanel({
  activeView,
  account,
  stats,
  tasks,
  isLoading,
  error,
  platformLabel,
}: {
  activeView: WeArchiveViewId;
  account: WeArchiveOverviewAccount | null;
  stats: WeArchiveOverviewStats;
  tasks: WeArchiveOverviewTask[];
  isLoading: boolean;
  error: string | null;
  platformLabel: string;
}) {
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

function WindowsWindowControls({
  controls,
}: {
  controls: WeArchiveWindowControls | undefined;
}) {
  return (
    <HStack gap={0} vAlign="stretch" className={sx(styles.windowControls)}>
      <Button
        className={sx(styles.windowControl)}
        label="最小化"
        variant="ghost"
        size="md"
        isIconOnly
        icon={<Icon icon={Minus} size="sm" />}
        onClick={() => controls?.minimize?.()}
      />
      <Button
        className={sx(styles.windowControl)}
        label="最大化"
        variant="ghost"
        size="md"
        isIconOnly
        icon={<Icon icon={Maximize2} size="sm" />}
        onClick={() => controls?.toggleMaximize?.()}
      />
      <Button
        className={sx(styles.windowControl, styles.windowControlClose)}
        label="关闭"
        variant="ghost"
        size="md"
        isIconOnly
        icon={<Icon icon={X} size="sm" />}
        onClick={() => controls?.close?.()}
      />
    </HStack>
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

function getViewSubtitle(
  activeView: WeArchiveViewId,
  account: WeArchiveOverviewAccount | null,
  platformLabel: string,
) {
  if (activeView === "overview") {
    return account
      ? `${account.nickname ?? account.wxid ?? "微信账号"} 的备份状态`
      : `${platformLabel}已接入 WeArchive 服务`;
  }

  return "当前先接入整体布局，后续页面内容会按模块继续补齐";
}

function formatStorage(value: number) {
  if (!value) {
    return "0 B";
  }

  return formatFileSize(value);
}

type StyleArg = StyleXArray<
  | null
  | undefined
  | CompiledStyles
  | boolean
  | Readonly<[CompiledStyles, InlineStyles]>
>;

function sx(...compiledStyles: StyleArg[]) {
  return stylex.props(...compiledStyles).className ?? "";
}

const styles = stylex.create({
  stage: {
    minWidth: 0,
    minHeight: 0,
    height: "100vh",
  },
  embeddedStage: {
    backgroundColor: "var(--color-background-surface)",
  },
  desktopStage: {
    backgroundColor: "var(--color-background-body)",
  },
  window: {
    minWidth: 0,
    minHeight: 0,
    overflow: "hidden",
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border-emphasized)",
    borderRadius: "var(--radius-container)",
    backgroundColor: "var(--color-background-surface)",
    boxShadow: "var(--shadow-high)",
  },
  embeddedWindow: {
    borderWidth: 0,
    borderRadius: "var(--radius-none)",
    boxShadow: "none",
  },
  shell: {
    minWidth: 0,
    minHeight: 0,
    height: "100%",
    backgroundColor: "var(--color-background-surface)",
  },
  topNav: {
    minHeight: "calc(var(--spacing-12) + var(--spacing-1-5))",
    borderBottomWidth: "var(--border-width)",
    borderBottomStyle: "solid",
    borderBottomColor: "var(--color-border)",
    backgroundColor:
      "color-mix(in srgb, var(--color-background-surface) 94%, transparent)",
  },
  desktopTopNav: {
    WebkitAppRegion: "drag",
  },
  titleStart: {
    minWidth: "calc(var(--spacing-12) * 4)",
  },
  nativeTrafficSpace: {
    width: "calc(var(--spacing-12) + var(--spacing-8))",
    height: "var(--spacing-3)",
    flexShrink: 0,
  },
  searchCluster: {
    minWidth: 0,
  },
  topActions: {
    height: "100%",
    whiteSpace: "nowrap",
  },
  backupAction: {
    backgroundColor: "var(--color-success)",
    color: "var(--color-on-success)",
    WebkitAppRegion: "no-drag",
    ":hover": {
      backgroundColor:
        "color-mix(in srgb, var(--color-success) 88%, var(--color-on-light))",
    },
  },
  windowControls: {
    height: "100%",
    marginInlineStart: "var(--spacing-1)",
    WebkitAppRegion: "no-drag",
  },
  windowControl: {
    width: "var(--spacing-11)",
    height: "100%",
    borderRadius: "var(--radius-none)",
  },
  windowControlClose: {
    ":hover": {
      backgroundColor: "var(--color-error)",
      color: "var(--color-on-error)",
    },
  },
  sideNav: {
    minWidth: 0,
    overflowX: "hidden",
    backgroundColor: "var(--color-background-surface)",
  },
  brandMark: {
    borderRadius: "var(--radius-element)",
    backgroundColor: "var(--color-background-inverted)",
    color: "var(--color-background-surface)",
  },
  libraryMeta: {
    paddingInline: "var(--spacing-3)",
    paddingBlockEnd: "var(--spacing-2)",
  },
  main: {
    minHeight: 0,
    overflow: "auto",
    backgroundColor: "var(--color-background-body)",
  },
  content: {
    minHeight: "100%",
    padding: "var(--spacing-6)",
  },
  contentHeader: {
    justifyContent: "space-between",
  },
  contentTitle: {
    minWidth: 0,
  },
  notice: {
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border-emphasized)",
    borderRadius: "var(--radius-container)",
    backgroundColor: "var(--color-background-surface)",
  },
  metricGrid: {
    width: "100%",
    minWidth: 0,
  },
  metricCard: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: "calc(var(--spacing-12) * 3)",
    padding: "var(--spacing-4)",
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border)",
    borderRadius: "var(--radius-container)",
    backgroundColor: "var(--color-background-surface)",
  },
  workspace: {
    width: "100%",
    minWidth: 0,
  },
  panel: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    padding: "var(--spacing-4)",
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border)",
    borderRadius: "var(--radius-container)",
    backgroundColor: "var(--color-background-surface)",
  },
  taskRow: {
    minWidth: 0,
    paddingBlock: "var(--spacing-2)",
  },
});
