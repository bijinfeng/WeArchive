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
import { StatusDot } from "@astryxdesign/core/StatusDot";
import type {
  WeArchiveOverviewAccount,
  WeArchiveViewId,
} from "@we-archive/core/types";
import { HardDrive, ShieldCheck } from "lucide-react";
import type { RefObject } from "react";

import { styles, sx } from "./styles";
import type { NavSection } from "./types";

interface WeArchiveSideNavProps {
  account: WeArchiveOverviewAccount | null;
  activeView: WeArchiveViewId;
  error: string | null;
  isCollapsed: boolean;
  isDesktopChrome: boolean;
  navSections: NavSection[];
  sideNavHandleRef: RefObject<SideNavImperativeCollapseHandle | null>;
  onCollapsedChange: (isCollapsed: boolean) => void;
  onActiveViewChange: (viewId: WeArchiveViewId) => void;
}

export function WeArchiveSideNav({
  account,
  activeView,
  error,
  isCollapsed,
  isDesktopChrome,
  navSections,
  sideNavHandleRef,
  onCollapsedChange,
  onActiveViewChange,
}: WeArchiveSideNavProps) {
  const statusLabel = error
    ? "服务异常"
    : account
      ? `${account.nickname} 已连接`
      : "等待导入账号";

  return (
    <SideNav
      className={sx(styles.sideNav, isDesktopChrome && styles.desktopSideNav)}
      handleRef={sideNavHandleRef}
      collapsible={{
        buttonLabel: "折叠侧边栏",
        hasButton: false,
        isCollapsed,
        onCollapsedChange,
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
            label={isCollapsed ? (error ? "异常" : "正常") : statusLabel}
            icon={HardDrive}
            endContent={
              <StatusDot
                variant={error ? "error" : "success"}
                label={error ? "异常" : "正常"}
              />
            }
          />
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
