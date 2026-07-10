import { HStack, Stack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import type {
  RestorePointSummary,
  RestoreStrategyInput,
  RestoreStrategyPreview,
} from "@we-archive/core/types";
import { useEffect, useMemo, useState } from "react";

import { RestoreImpactPreview } from "./RestoreImpactPreview";
import { RestorePointList } from "./RestorePointList";
import { RestoreStrategyPanel } from "./RestoreStrategyPanel";
import { restoreStyles, sx } from "./styles";

export interface RestorePageProps {
  query?: string;
  points: RestorePointSummary[];
  preview: RestoreStrategyPreview | null;
  onCheckPoint: (restorePointId: number) => Promise<RestorePointSummary | null>;
  onPreviewStrategy: (
    input: RestoreStrategyInput,
  ) => Promise<RestoreStrategyPreview>;
  onExecuteRestore: (
    input: RestoreStrategyInput,
  ) => Promise<unknown> | undefined;
}

export function RestorePage({
  query = "",
  points,
  preview,
  onCheckPoint,
  onPreviewStrategy,
  onExecuteRestore,
}: RestorePageProps) {
  const [selectedPointId, setSelectedPointId] = useState<number | null>(
    points[0]?.id ?? null,
  );
  const [checkedPointId, setCheckedPointId] = useState<number | null>(null);
  const [strategy, setStrategy] =
    useState<RestoreStrategyInput["strategy"]>("merge");
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [currentPreview, setCurrentPreview] =
    useState<RestoreStrategyPreview | null>(preview);

  useEffect(() => {
    setCurrentPreview(preview);
  }, [preview]);

  const filteredPoints = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return points;
    }

    return points.filter((point) =>
      `${point.name} ${point.status}`.toLowerCase().includes(normalizedQuery),
    );
  }, [points, query]);

  const previewStrategy = async (
    nextStrategy: RestoreStrategyInput["strategy"],
  ) => {
    setStrategy(nextStrategy);
    const nextPreview = await onPreviewStrategy({
      strategy: nextStrategy,
      ...(selectedPointId ? { restorePointId: selectedPointId } : {}),
    });
    setCurrentPreview(nextPreview);
  };

  const canAttemptExecute =
    selectedPointId !== null &&
    checkedPointId === selectedPointId &&
    (strategy !== "overwrite" || confirmationChecked);

  return (
    <VStack gap={4} className={sx(restoreStyles.page)}>
      <HStack gap={3} vAlign="center">
        <VStack gap={1}>
          <Text weight="bold">恢复管理</Text>
          <Text type="supporting" color="secondary">
            检查恢复点，预览恢复策略，MVP 阶段不执行覆盖写入。
          </Text>
        </VStack>
      </HStack>
      <Stack className={sx(restoreStyles.frame)}>
        <RestorePointList
          points={filteredPoints}
          selectedPointId={selectedPointId}
          checkedPointId={checkedPointId}
          onSelectPoint={setSelectedPointId}
          onCheckPoint={async (pointId) => {
            const checkedPoint = await onCheckPoint(pointId);

            if (checkedPoint) {
              setCheckedPointId(pointId);
            }
          }}
        />
        <RestoreStrategyPanel
          strategy={strategy}
          confirmationChecked={confirmationChecked}
          onStrategyChange={(nextStrategy) => {
            void previewStrategy(nextStrategy);
          }}
          onConfirmationChange={setConfirmationChecked}
        />
        <RestoreImpactPreview
          preview={currentPreview}
          canAttemptExecute={canAttemptExecute}
          onExecuteRestore={() => {
            if (!selectedPointId) {
              return;
            }

            void onExecuteRestore({
              strategy,
              restorePointId: selectedPointId,
            });
          }}
        />
      </Stack>
    </VStack>
  );
}
