import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import type { RestoreStrategyPreview } from "@we-archive/core/types";

import { DisabledReason } from "../../wearchive-feedback";
import { restoreStyles, sx } from "./styles";

export interface RestoreImpactPreviewProps {
  preview: RestoreStrategyPreview | null;
  canAttemptExecute: boolean;
  onExecuteRestore: () => void;
}

export function RestoreImpactPreview({
  preview,
  canAttemptExecute,
  onExecuteRestore,
}: RestoreImpactPreviewProps) {
  return (
    <Card padding={3} className={sx(restoreStyles.panel)}>
      <VStack gap={3}>
        <VStack gap={1}>
          <Text weight="bold">影响预览</Text>
          <Text type="supporting" color="secondary">
            检查策略风险、目标归档和执行状态。
          </Text>
        </VStack>
        {preview ? (
          <VStack gap={3}>
            <VStack gap={2} className={sx(restoreStyles.riskBox)}>
              {preview.risks.map((risk) => (
                <VStack key={risk.id} gap={1}>
                  <Text weight="bold">{risk.title}</Text>
                  <Text type="supporting" color="secondary">
                    {risk.description}
                  </Text>
                </VStack>
              ))}
            </VStack>
            <DisabledReason
              title="恢复执行已禁用"
              reason={preview.disabledReason}
            />
          </VStack>
        ) : (
          <Text type="supporting" color="secondary">
            选择恢复点和策略后会显示影响预览。
          </Text>
        )}
        <HStack gap={2}>
          <Button
            label="执行恢复"
            variant="primary"
            size="sm"
            isDisabled={!canAttemptExecute || Boolean(preview?.disabledReason)}
            tooltip={
              preview?.disabledReason ?? "请先选择恢复点、检查恢复点并确认风险"
            }
            onClick={() => {
              if (!canAttemptExecute || preview?.disabledReason) {
                return;
              }

              onExecuteRestore();
            }}
          />
          <Button label="导出恢复报告" variant="secondary" size="sm" />
        </HStack>
      </VStack>
    </Card>
  );
}
