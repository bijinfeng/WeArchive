import { HStack, VStack } from "@astryxdesign/core/Stack";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Text } from "@astryxdesign/core/Text";
import { Token } from "@astryxdesign/core/Token";

import { sx, transferStyles } from "./styles";

export interface TransferStepperProps {
  steps: readonly string[];
  activeStep: number;
  warningStep?: number;
}

export function TransferStepper({
  steps,
  activeStep,
  warningStep,
}: TransferStepperProps) {
  return (
    <VStack gap={0} className={sx(transferStyles.panel)} aria-label="流程步骤">
      <Text weight="bold">流程步骤</Text>
      {steps.map((step, index) => {
        const status = getStepStatus(index, activeStep, warningStep);

        return (
          <HStack
            key={step}
            gap={2}
            vAlign="center"
            className={sx(transferStyles.stepRow)}
          >
            <StatusDot variant={status.variant} label={status.label} />
            <VStack gap={0}>
              <Text>{step}</Text>
              <Text type="supporting" color="secondary">
                {status.label}
              </Text>
            </VStack>
            {index === activeStep ? (
              <Token label="当前" color="green" size="sm" />
            ) : null}
          </HStack>
        );
      })}
    </VStack>
  );
}

function getStepStatus(
  index: number,
  activeStep: number,
  warningStep: number | undefined,
) {
  if (warningStep === index) {
    return { label: "有警告", variant: "warning" as const };
  }
  if (index < activeStep) {
    return { label: "已完成", variant: "success" as const };
  }
  if (index === activeStep) {
    return { label: "进行中", variant: "accent" as const };
  }
  return { label: "未开始", variant: "neutral" as const };
}
