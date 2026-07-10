import { AppShell as AstryxAppShell } from "@astryxdesign/core/AppShell";
import { Layout, LayoutContent } from "@astryxdesign/core/Layout";
import type { SideNavImperativeCollapseHandle } from "@astryxdesign/core/SideNav";
import { Stack } from "@astryxdesign/core/Stack";
import { Theme } from "@astryxdesign/core/theme";
import type { WeArchiveViewId } from "@we-archive/core/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { wearchiveTheme as weArchiveTheme } from "../theme/wearchive";
import "../theme/wearchive.css";
import { NAV_SECTIONS } from "./wearchive-shell/constants";
import { WeArchivePageProvider } from "./wearchive-shell/pageContext";
import {
  countSearchTargets,
  focusFirstSearchTarget,
  SEARCH_TARGET_ATTRIBUTE,
} from "./wearchive-shell/searchTargets";
import {
  readStoredSideNavCollapsed,
  writeStoredSideNavCollapsed,
} from "./wearchive-shell/shellState";
import { styles, sx } from "./wearchive-shell/styles";
import type { WeArchiveShellProps } from "./wearchive-shell/types";
import { WeArchivePageSlot } from "./wearchive-shell/WeArchivePageSlot";
import { WeArchiveSideNav } from "./wearchive-shell/WeArchiveSideNav";
import { WeArchiveTopNav } from "./wearchive-shell/WeArchiveTopNav";

export type {
  WeArchiveRuntimePlatform,
  WeArchiveShellProps,
  WeArchiveWindowControls,
} from "./wearchive-shell/types";

export function WeArchiveShell({
  account = null,
  archiveStatus,
  issues,
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
  children,
}: WeArchiveShellProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const sideNavHandleRef = useRef<SideNavImperativeCollapseHandle | null>(null);
  const [internalActiveView, setInternalActiveView] =
    useState<WeArchiveViewId>(defaultActiveView);
  const [isSideNavCollapsed, setIsSideNavCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return readStoredSideNavCollapsed(window.localStorage) ?? false;
  });
  const [query, setQuery] = useState("");
  const [searchResultCount, setSearchResultCount] = useState<number | null>(
    null,
  );
  const activeView = controlledActiveView ?? internalActiveView;
  const isDesktopChrome = chrome === "desktop";
  const isMacClient = isDesktopChrome && runtimePlatform === "darwin";
  const isWindowsClient = isDesktopChrome && runtimePlatform === "win32";

  const handleBackupAction = useCallback(() => {
    void onBackupAction?.();
  }, [onBackupAction]);

  const handleSideNavCollapsedChange = useCallback((isCollapsed: boolean) => {
    setIsSideNavCollapsed(isCollapsed);

    if (typeof window !== "undefined") {
      writeStoredSideNavCollapsed(window.localStorage, isCollapsed);
    }
  }, []);

  const handleSearchSubmit = useCallback(() => {
    const root = contentRef.current ?? document;

    focusFirstSearchTarget(root, query);
  }, [query]);

  useEffect(() => {
    const root = contentRef.current;

    if (!query.trim() || !root) {
      setSearchResultCount(null);
      return;
    }

    const updateSearchResultCount = () => {
      setSearchResultCount(countSearchTargets(root, query));
    };

    updateSearchResultCount();

    if (typeof MutationObserver === "undefined") {
      return;
    }

    const observer = new MutationObserver(updateSearchResultCount);
    observer.observe(root, {
      attributes: true,
      attributeFilter: [SEARCH_TARGET_ATTRIBUTE],
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [activeView, query]);

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

  const pageContextValue = useMemo(
    () => ({
      account,
      archiveStatus,
      issues,
      stats,
      tasks,
      query,
      isLoading,
      error,
      platformLabel,
      onBackupAction: handleBackupAction,
      onNavigate: setActiveView,
    }),
    [
      account,
      archiveStatus,
      issues,
      stats,
      tasks,
      query,
      isLoading,
      error,
      platformLabel,
      handleBackupAction,
      setActiveView,
    ],
  );

  return (
    <Theme theme={weArchiveTheme} mode="light">
      <Stack
        className={sx(
          styles.stage,
          isDesktopChrome ? styles.desktopStage : styles.embeddedStage,
        )}
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
                searchResultCount={searchResultCount}
                sideNavHandleRef={sideNavHandleRef}
                windowControls={windowControls}
                onBackupAction={handleBackupAction}
                onQueryChange={setQuery}
                onSearchSubmit={handleSearchSubmit}
              />
            }
            sideNav={
              <WeArchiveSideNav
                account={account}
                activeView={activeView}
                error={error}
                isCollapsed={isSideNavCollapsed}
                isDesktopChrome={isDesktopChrome}
                navSections={navSections}
                sideNavHandleRef={sideNavHandleRef}
                onCollapsedChange={handleSideNavCollapsedChange}
                onActiveViewChange={setActiveView}
              />
            }
          >
            <Layout
              height="fill"
              content={
                <LayoutContent
                  ref={contentRef}
                  className={sx(
                    styles.main,
                    isDesktopChrome && styles.desktopMain,
                  )}
                  padding={0}
                >
                  <WeArchivePageProvider value={pageContextValue}>
                    {children ?? (
                      <WeArchivePageSlot
                        activeView={activeView}
                        account={account}
                        archiveStatus={archiveStatus}
                        issues={issues}
                        stats={stats}
                        tasks={tasks}
                        query={query}
                        isLoading={isLoading}
                        error={error}
                        platformLabel={platformLabel}
                        onBackupAction={handleBackupAction}
                        onNavigate={setActiveView}
                      />
                    )}
                  </WeArchivePageProvider>
                </LayoutContent>
              }
            />
          </AstryxAppShell>
        </Stack>
      </Stack>
    </Theme>
  );
}
