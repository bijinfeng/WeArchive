import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { CheckboxInput } from "@astryxdesign/core/CheckboxInput";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import type { RestoreStrategyInput } from "@we-archive/core/types";

import { restoreStyles, sx } from "./styles";

export interface RestoreStrategyPanelProps {
  strategy: RestoreStrategyInput["strategy"];
  confirmationChecked: boolean;
  onStrategyChange: (strategy: RestoreStrategyInput["strategy"]) => void;
  onConfirmationChange: (checked: boolean) => void;
}

export function RestoreStrategyPanel({
  strategy,
  confirmationChecked,
  onStrategyChange,
  onConfirmationChange,
}: RestoreStrategyPanelProps) {
  return (
    <Card padding={3} className={sx(restoreStyles.panel)}>
      <VStack gap={3}>
        <VStack gap={1}>
          <Text weight="bold">恢复策略</Text>
          <Text type="supporting" color="secondary">
            MVP 允许检查策略和影响，但不会执行覆盖写入。
          </Text>
        </VStack>
        <StrategyButton
          label="合并到当前归档"
          description="保留当前数据，补充恢复点中缺失的记录。"
          selected={strategy === "merge"}
          onClick={() => onStrategyChange("merge")}
        />
        <StrategyButton
          label="覆盖当前归档"
          description="高风险策略，会替换当前数据，MVP 中保持禁用。"
          selected={strategy === "overwrite"}
          onClick={() => onStrategyChange("overwrite")}
        />
        <StrategyButton
          label="生成新归档"
          description="保留当前归档，把恢复结果写入新的归档位置。"
          selected={strategy === "new-archive"}
          onClick={() => onStrategyChange("new-archive")}
        />
        {strategy === "overwrite" ? (
          <CheckboxInput
            label="我理解覆盖风险"
            value={confirmationChecked}
            onChange={onConfirmationChange}
          />
        ) : null}
      </VStack>
    </Card>
  );
}

function StrategyButton({
  label,
  description,
  selected,
  onClick,
}: {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <VStack gap={2} className={sx(restoreStyles.row)}>
      <HStack gap={2} vAlign="center">
        <Text weight="bold">{label}</Text>
      </HStack>
      <Text type="supporting" color="secondary">
        {description}
      </Text>
      <Button
        label={label}
        variant={selected ? "primary" : "secondary"}
        size="sm"
        onClick={onClick}
      />
    </VStack>
  );
}
