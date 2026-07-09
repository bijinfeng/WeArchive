import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import {
  SideNavCollapseButton,
  type SideNavImperativeCollapseHandle,
} from "@astryxdesign/core/SideNav";
import { HStack, Stack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Token } from "@astryxdesign/core/Token";
import { TopNav } from "@astryxdesign/core/TopNav";
import type { WeArchiveViewId } from "@we-archive/core/types";
import { Menu, Plus, Search } from "lucide-react";
import type { RefObject } from "react";

import { VIEW_PLACEHOLDERS } from "./constants";
import { styles, sx } from "./styles";
import type { WeArchiveWindowControls } from "./types";
import { WindowsWindowControls } from "./WindowsWindowControls";

interface WeArchiveTopNavProps {
  activeView: WeArchiveViewId;
  isDesktopChrome: boolean;
  isMacClient: boolean;
  isWindowsClient: boolean;
  platformLabel: string;
  query: string;
  sideNavHandleRef: RefObject<SideNavImperativeCollapseHandle | null>;
  windowControls: WeArchiveWindowControls | undefined;
  onBackupAction: () => void;
  onQueryChange: (query: string) => void;
}

export function WeArchiveTopNav({
  activeView,
  isDesktopChrome,
  isMacClient,
  isWindowsClient,
  platformLabel,
  query,
  sideNavHandleRef,
  windowControls,
  onBackupAction,
  onQueryChange,
}: WeArchiveTopNavProps) {
  return (
    <TopNav
      className={sx(styles.topNav, isDesktopChrome && styles.desktopTopNav)}
      label="WeArchive 主导航"
      heading={
        <HStack gap={3} vAlign="center" className={sx(styles.titleStart)}>
          {isMacClient ? (
            <Stack className={sx(styles.nativeTrafficSpace)} aria-hidden />
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
            className={sx(styles.headerControl)}
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
          className={sx(styles.searchCluster, styles.headerControl)}
        >
          <TextInput
            label="全局搜索"
            isLabelHidden
            size="sm"
            width="min(38vw, calc(var(--spacing-12) * 10))"
            startIcon={Search}
            placeholder={VIEW_PLACEHOLDERS[activeView]}
            value={query}
            onChange={onQueryChange}
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
          className={sx(styles.topActions, styles.headerControl)}
        >
          <Button
            className={sx(styles.backupAction)}
            label="立即备份"
            variant="primary"
            size="md"
            icon={<Icon icon={Plus} size="sm" />}
            onClick={onBackupAction}
          />
          {isWindowsClient ? (
            <WindowsWindowControls controls={windowControls} />
          ) : null}
        </HStack>
      }
    />
  );
}
