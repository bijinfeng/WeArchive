import { Badge } from "@astryxdesign/core/Badge";
import { Icon } from "@astryxdesign/core/Icon";
import { NavIcon } from "@astryxdesign/core/NavIcon";
import {
  SideNav,
  SideNavHeading,
  type SideNavImperativeCollapseHandle,
  SideNavItem,
  SideNavSection,
} from "@astryxdesign/core/SideNav";
import { VStack } from "@astryxdesign/core/Stack";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Text } from "@astryxdesign/core/Text";
import type {
  WeArchiveOverviewAccount,
  WeArchiveOverviewStats,
  WeArchiveViewId,
} from "@we-archive/core/types";
import { HardDrive, ShieldCheck } from "lucide-react";
import type { RefObject } from "react";

import { styles, sx } from "./styles";
import type { NavSection } from "./types";
import { formatStorage } from "./utils";

interface WeArchiveSideNavProps {
  account: WeArchiveOverviewAccount | null;
  activeView: WeArchiveViewId;
  error: string | null;
  isDesktopChrome: boolean;
  navSections: NavSection[];
  sideNavHandleRef: RefObject<SideNavImperativeCollapseHandle | null>;
  stats: WeArchiveOverviewStats;
  onActiveViewChange: (viewId: WeArchiveViewId) => void;
}

export function WeArchiveSideNav({
  account,
  activeView,
  error,
  isDesktopChrome,
  navSections,
  sideNavHandleRef,
  stats,
  onActiveViewChange,
}: WeArchiveSideNavProps) {
  return (
    <SideNav
      className={sx(styles.sideNav, isDesktopChrome && styles.desktopSideNav)}
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
              onClick={() => onActiveViewChange(item.id)}
              endContent={
                typeof item.count === "number" && item.count > 0 ? (
                  <Badge
                    label={item.count}
                    variant={item.id === activeView ? "green" : "neutral"}
                  />
                ) : undefined
              }
            />
          ))}
        </SideNavSection>
      ))}
    </SideNav>
  );
}
