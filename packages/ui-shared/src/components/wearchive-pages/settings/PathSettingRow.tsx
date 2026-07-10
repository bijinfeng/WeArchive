import { Button } from "@astryxdesign/core/Button";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";

import { settingsStyles, sx } from "./styles";

export interface PathSettingRowProps {
  label: string;
  settingKey: string;
  path: string;
  status?: "idle" | "checking" | "writable" | "blocked";
  onCheckPath: (key: string, path: string) => void;
}

export function PathSettingRow({
  label,
  settingKey,
  path,
  status = "idle",
  onCheckPath,
}: PathSettingRowProps) {
  return (
    <HStack gap={3} vAlign="center" className={sx(settingsStyles.row)}>
      <VStack gap={1} className={sx(settingsStyles.rowMeta)}>
        <Text weight="bold">{label}</Text>
        <Text type="supporting" color="secondary">
          {path}
        </Text>
        {status !== "idle" ? (
          <Text
            type="supporting"
            className={sx(
              settingsStyles.statusBox,
              status === "writable" && settingsStyles.successBox,
              status === "blocked" && settingsStyles.errorBox,
            )}
          >
            {status === "checking"
              ? "正在检查"
              : status === "writable"
                ? "路径可写"
                : "路径不可写"}
          </Text>
        ) : null}
      </VStack>
      <Button
        label={`检查${label}`}
        variant="secondary"
        size="sm"
        onClick={() => onCheckPath(settingKey, path)}
      />
    </HStack>
  );
}
