import type {
  WeArchiveArchiveStatus,
  WeArchiveIssue,
  WeArchiveOverviewAccount,
  WeArchiveOverviewStats,
  WeArchiveOverviewTask,
  WeArchiveViewId,
} from "@we-archive/core/types";
import { createContext, type ReactNode, useContext } from "react";

export interface WeArchivePageContextValue {
  account: WeArchiveOverviewAccount | null;
  archiveStatus?: WeArchiveArchiveStatus | undefined;
  issues?: WeArchiveIssue[] | undefined;
  stats: WeArchiveOverviewStats;
  tasks: WeArchiveOverviewTask[];
  query: string;
  isLoading: boolean;
  error: string | null;
  platformLabel: string;
  onBackupAction: () => void;
  onNavigate: (viewId: WeArchiveViewId) => void;
}

const WeArchivePageContext = createContext<WeArchivePageContextValue | null>(
  null,
);

interface WeArchivePageProviderProps {
  value: WeArchivePageContextValue;
  children: ReactNode;
}

export function WeArchivePageProvider({
  value,
  children,
}: WeArchivePageProviderProps) {
  return (
    <WeArchivePageContext.Provider value={value}>
      {children}
    </WeArchivePageContext.Provider>
  );
}

export function useWeArchivePageContext() {
  const context = useContext(WeArchivePageContext);

  if (!context) {
    throw new Error("WeArchive route pages must render inside WeArchiveShell");
  }

  return context;
}
