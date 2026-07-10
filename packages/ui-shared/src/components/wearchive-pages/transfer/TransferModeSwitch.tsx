import {
  SegmentedControl,
  SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";

import type { TransferMode } from "./transferState";

export interface TransferModeSwitchProps {
  mode: TransferMode;
  onModeChange: (mode: TransferMode) => void;
}

export function TransferModeSwitch({
  mode,
  onModeChange,
}: TransferModeSwitchProps) {
  return (
    <SegmentedControl
      value={mode}
      onChange={(value) => onModeChange(value as TransferMode)}
      label="导入导出模式"
      size="sm"
    >
      <SegmentedControlItem value="import" label="导入" />
      <SegmentedControlItem value="export" label="导出" />
    </SegmentedControl>
  );
}
