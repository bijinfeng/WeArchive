import { ToastViewport } from "@astryxdesign/core/Toast";
import type { ReactNode } from "react";

export interface WeArchiveToastProviderProps {
  children: ReactNode;
}

export function WeArchiveToastProvider({
  children,
}: WeArchiveToastProviderProps) {
  return (
    <ToastViewport position="bottomEnd" maxVisible={4}>
      {children}
    </ToastViewport>
  );
}
