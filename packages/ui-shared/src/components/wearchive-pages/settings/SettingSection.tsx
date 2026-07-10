import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import type { ReactNode } from "react";

import { settingsStyles, sx } from "./styles";

export interface SettingSectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function SettingSection({
  title,
  description,
  children,
}: SettingSectionProps) {
  return (
    <Card padding={3} className={sx(settingsStyles.section)}>
      <VStack gap={3}>
        <VStack gap={1}>
          <Text weight="bold">{title}</Text>
          <Text type="supporting" color="secondary">
            {description}
          </Text>
        </VStack>
        <VStack gap={0}>{children}</VStack>
      </VStack>
    </Card>
  );
}
