import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { HStack } from "@astryxdesign/core/Stack";
import { Maximize2, Minus, X } from "lucide-react";

import { styles, sx } from "./styles";
import type { WeArchiveWindowControls } from "./types";

export function WindowsWindowControls({
  controls,
}: {
  controls: WeArchiveWindowControls | undefined;
}) {
  return (
    <HStack gap={0} vAlign="stretch" className={sx(styles.windowControls)}>
      <Button
        className={sx(styles.windowControl)}
        label="最小化"
        variant="ghost"
        size="md"
        isIconOnly
        icon={<Icon icon={Minus} size="sm" />}
        onClick={() => controls?.minimize?.()}
      />
      <Button
        className={sx(styles.windowControl)}
        label="最大化"
        variant="ghost"
        size="md"
        isIconOnly
        icon={<Icon icon={Maximize2} size="sm" />}
        onClick={() => controls?.toggleMaximize?.()}
      />
      <Button
        className={sx(styles.windowControl, styles.windowControlClose)}
        label="关闭"
        variant="ghost"
        size="md"
        isIconOnly
        icon={<Icon icon={X} size="sm" />}
        onClick={() => controls?.close?.()}
      />
    </HStack>
  );
}
