import { Icon } from "@astryxdesign/core/Icon";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Token } from "@astryxdesign/core/Token";
import { ShieldAlert } from "lucide-react";

import { feedbackStyles, sx } from "./styles";

export interface DisabledReasonProps {
  title: string;
  reason: string;
}

export function DisabledReason({ title, reason }: DisabledReasonProps) {
  return (
    <HStack
      gap={3}
      vAlign="start"
      className={sx(feedbackStyles.disabledReason)}
    >
      <Icon
        icon={ShieldAlert}
        size="sm"
        className={sx(feedbackStyles.disabledReasonIcon)}
      />
      <VStack gap={1} className={sx(feedbackStyles.disabledReasonText)}>
        <HStack gap={2} vAlign="center">
          <Text weight="bold">{title}</Text>
          <Token label="已禁用" color="orange" size="sm" />
        </HStack>
        <Text type="supporting" color="secondary">
          {reason}
        </Text>
      </VStack>
    </HStack>
  );
}
