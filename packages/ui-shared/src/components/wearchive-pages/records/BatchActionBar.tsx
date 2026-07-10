import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import type { WeArchiveViewId } from "@we-archive/core/types";

import type { RecordsNavigationIntent } from "./recordsModel";
import { recordsStyles, sx } from "./styles";

export interface BatchActionBarProps {
  selectedIds: string[];
  onClear: () => void;
  onNavigate?:
    | ((viewId: WeArchiveViewId, intent?: RecordsNavigationIntent) => void)
    | undefined;
}

export function BatchActionBar({
  selectedIds,
  onClear,
  onNavigate,
}: BatchActionBarProps) {
  return (
    <HStack
      gap={3}
      vAlign="center"
      role="region"
      aria-label="批量操作"
      className={sx(recordsStyles.batchBar)}
    >
      <Text weight="bold">已选 {selectedIds.length} 个</Text>
      <HStack gap={2} className={sx(recordsStyles.batchActions)}>
        <Button
          label="导出"
          variant="primary"
          isDisabled={selectedIds.length === 0}
          onClick={() =>
            onNavigate?.("transfer", {
              source: "records-batch",
              mode: "export",
              conversationIds: selectedIds,
            })
          }
        />
        <Button
          label="重新备份"
          variant="secondary"
          isDisabled={selectedIds.length === 0}
        />
        <Button
          label="添加标签"
          variant="secondary"
          isDisabled={selectedIds.length === 0}
        />
        <Button label="取消选择" variant="ghost" onClick={onClear} />
      </HStack>
    </HStack>
  );
}
