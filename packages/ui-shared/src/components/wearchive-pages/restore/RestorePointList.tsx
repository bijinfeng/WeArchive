import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Token } from "@astryxdesign/core/Token";
import type { RestorePointSummary } from "@we-archive/core/types";

import { restoreStyles, sx } from "./styles";

export interface RestorePointListProps {
  points: RestorePointSummary[];
  selectedPointId: number | null;
  checkedPointId: number | null;
  onSelectPoint: (pointId: number) => void;
  onCheckPoint: (pointId: number) => void;
}

export function RestorePointList({
  points,
  selectedPointId,
  checkedPointId,
  onSelectPoint,
  onCheckPoint,
}: RestorePointListProps) {
  return (
    <Card padding={3} className={sx(restoreStyles.panel)}>
      <VStack gap={3}>
        <VStack gap={1}>
          <Text weight="bold">恢复点</Text>
          <Text type="supporting" color="secondary">
            先检查恢复点，再预览恢复影响。
          </Text>
        </VStack>
        {points.map((point) => (
          <VStack
            key={point.id}
            gap={2}
            className={sx(
              restoreStyles.row,
              point.id === selectedPointId && restoreStyles.rowActive,
            )}
          >
            <HStack gap={2} vAlign="center">
              <Text weight="bold">{point.name}</Text>
              <Token
                label={checkedPointId === point.id ? "检查通过" : "可检查"}
                color={checkedPointId === point.id ? "green" : "blue"}
                size="sm"
              />
            </HStack>
            <Text type="supporting" color="secondary">
              创建于 {point.createdAt.toLocaleString()}
            </Text>
            <HStack gap={2}>
              <Button
                label="选择"
                variant={point.id === selectedPointId ? "primary" : "secondary"}
                size="sm"
                onClick={() => onSelectPoint(point.id)}
              />
              <Button
                label="检查恢复点"
                variant="secondary"
                size="sm"
                onClick={() => onCheckPoint(point.id)}
              />
            </HStack>
          </VStack>
        ))}
      </VStack>
    </Card>
  );
}
