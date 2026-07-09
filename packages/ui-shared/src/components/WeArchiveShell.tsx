import { AppShell as AstryxAppShell } from "@astryxdesign/core/AppShell";
import { Layout, LayoutContent } from "@astryxdesign/core/Layout";
import type { SideNavImperativeCollapseHandle } from "@astryxdesign/core/SideNav";
import { Stack } from "@astryxdesign/core/Stack";
import type { WeArchiveViewId } from "@we-archive/core/types";
import { useCallback, useMemo, useRef, useState } from "react";

import { NAV_SECTIONS } from "./wearchive-shell/constants";
import { OverviewPanel } from "./wearchive-shell/OverviewPanel";
import { styles, sx } from "./wearchive-shell/styles";
import type { WeArchiveShellProps } from "./wearchive-shell/types";
import { WeArchiveSideNav } from "./wearchive-shell/WeArchiveSideNav";
import { WeArchiveTopNav } from "./wearchive-shell/WeArchiveTopNav";

export type {
  WeArchiveRuntimePlatform,
  WeArchiveShellProps,
  WeArchiveWindowControls,
} from "./wearchive-shell/types";

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
      padding={0}
    >
      <Stack
        className={sx(
          styles.window,
          isDesktopChrome ? styles.desktopWindow : styles.embeddedWindow,
        )}
        height="100%"
      >
        <AstryxAppShell
          className={sx(styles.shell)}
          contentPadding={0}
          height="fill"
          variant="section"
          mobileNav={{ breakpoint: "md" }}
          topNav={
            <WeArchiveTopNav
              activeView={activeView}
              isDesktopChrome={isDesktopChrome}
              isMacClient={isMacClient}
              isWindowsClient={isWindowsClient}
              platformLabel={platformLabel}
              query={query}
              sideNavHandleRef={sideNavHandleRef}
              windowControls={windowControls}
              onBackupAction={handleBackupAction}
              onQueryChange={setQuery}
            />
          }
          sideNav={
            <WeArchiveSideNav
              account={account}
              activeView={activeView}
              error={error}
              isDesktopChrome={isDesktopChrome}
              navSections={navSections}
              sideNavHandleRef={sideNavHandleRef}
              stats={stats}
              onActiveViewChange={setActiveView}
            />
          }
        >
          <Layout
            height="fill"
            content={
              <LayoutContent
                className={sx(
                  styles.main,
                  isDesktopChrome && styles.desktopMain,
                )}
                padding={0}
              >
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
