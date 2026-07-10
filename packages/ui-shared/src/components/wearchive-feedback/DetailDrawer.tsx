import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Layout, LayoutContent, LayoutFooter } from "@astryxdesign/core/Layout";
import type { ReactNode } from "react";

import { feedbackStyles, sx } from "./styles";

export interface DetailDrawerProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  ariaLabel?: string;
  children: ReactNode;
  footer?: ReactNode;
  onOpenChange: (isOpen: boolean) => void;
}

export function DetailDrawer({
  isOpen,
  title,
  subtitle,
  ariaLabel,
  children,
  footer,
  onOpenChange,
}: DetailDrawerProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      width="min(520px, calc(100vw - var(--spacing-6)))"
      maxHeight="calc(100dvh - var(--spacing-6))"
      position={{
        top: "var(--spacing-3)",
        right: "var(--spacing-3)",
        bottom: "var(--spacing-3)",
      }}
      purpose="info"
      aria-label={ariaLabel ?? title}
    >
      <Layout
        height="fill"
        header={
          <DialogHeader
            title={title}
            onOpenChange={onOpenChange}
            hasDivider
            {...(subtitle ? { subtitle } : {})}
          />
        }
        content={
          <LayoutContent className={sx(feedbackStyles.drawerContent)}>
            {children}
          </LayoutContent>
        }
        footer={
          footer ? (
            <LayoutFooter
              hasDivider
              className={sx(feedbackStyles.drawerFooter)}
            >
              {footer}
            </LayoutFooter>
          ) : undefined
        }
      />
    </Dialog>
  );
}
