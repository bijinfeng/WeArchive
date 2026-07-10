import type { WeArchiveViewId } from "@we-archive/core/types";

import { useWeArchivePageContext } from "./pageContext";
import { WeArchivePageSlot } from "./WeArchivePageSlot";

interface WeArchiveRoutePageProps {
  viewId: WeArchiveViewId;
}

export function WeArchiveRoutePage({ viewId }: WeArchiveRoutePageProps) {
  const pageContext = useWeArchivePageContext();

  return <WeArchivePageSlot activeView={viewId} {...pageContext} />;
}
