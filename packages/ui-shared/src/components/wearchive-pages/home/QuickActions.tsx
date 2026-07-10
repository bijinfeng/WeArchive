import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Grid } from "@astryxdesign/core/Grid";
import { Icon } from "@astryxdesign/core/Icon";
import { VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import type { WeArchiveViewId } from "@we-archive/core/types";
import {
  Archive,
  ArrowDownUp,
  type LucideIcon,
  MessageCircle,
  RotateCcw,
} from "lucide-react";

import type { HomeNavigationIntent } from "./homeModel";

interface QuickAction {
  label: string;
  description: string;
  icon: LucideIcon;
  view: WeArchiveViewId;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "查看聊天记录",
    description: "按联系人、群聊、关键词查看消息和附件。",
    icon: MessageCircle,
    view: "records",
  },
  {
    label: "导入旧备份",
    description: "从旧电脑、迁移包或连接手机微信导入。",
    icon: ArrowDownUp,
    view: "transfer",
  },
  {
    label: "导出聊天记录",
    description: "先选范围，再选格式，再选择保存位置。",
    icon: Archive,
    view: "transfer",
  },
  {
    label: "恢复到微信",
    description: "高风险写入前先确认设备和恢复策略。",
    icon: RotateCcw,
    view: "restore",
  },
];

export interface QuickActionsProps {
  onNavigate?:
    | ((viewId: WeArchiveViewId, intent?: HomeNavigationIntent) => void)
    | undefined;
}

export function QuickActions({ onNavigate }: QuickActionsProps) {
  return (
    <Card padding={4} role="region" aria-label="快捷操作">
      <VStack gap={3}>
        <Text weight="bold">快捷操作</Text>
        <Grid columns={{ minWidth: 180, repeat: "fit" }} gap={3}>
          {QUICK_ACTIONS.map((action) => (
            <Button
              key={action.label}
              label={action.label}
              variant="secondary"
              icon={<Icon icon={action.icon} size="sm" />}
              tooltip={action.description}
              onClick={() =>
                onNavigate?.(action.view, {
                  source: "home-quick-action",
                  metric: action.label,
                })
              }
            />
          ))}
        </Grid>
      </VStack>
    </Card>
  );
}
