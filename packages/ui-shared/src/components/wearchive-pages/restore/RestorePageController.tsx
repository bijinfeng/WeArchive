import { useQuery } from "@tanstack/react-query";

import { getApiAdapter } from "../../../hooks";
import { RestorePage } from "./RestorePage";

export interface RestorePageControllerProps {
  query?: string;
}

export function RestorePageController({ query }: RestorePageControllerProps) {
  const pointsQuery = useQuery({
    queryKey: ["restorePoints"],
    queryFn: () => getApiAdapter().restore.listPoints(),
  });
  const previewQuery = useQuery({
    queryKey: ["restorePreview", "merge"],
    queryFn: () =>
      getApiAdapter().restore.previewStrategy({
        strategy: "merge",
      }),
  });

  return (
    <RestorePage
      query={query ?? ""}
      points={pointsQuery.data ?? []}
      preview={previewQuery.data ?? null}
      onCheckPoint={(restorePointId) =>
        getApiAdapter().restore.checkPoint(restorePointId)
      }
      onPreviewStrategy={(input) =>
        getApiAdapter().restore.previewStrategy(input)
      }
      onExecuteRestore={(input) => getApiAdapter().restore.execute(input)}
    />
  );
}
