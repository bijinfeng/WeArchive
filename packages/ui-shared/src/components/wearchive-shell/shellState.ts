const SIDE_NAV_COLLAPSED_KEY = "wearchive.shell.sideNavCollapsed";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function readStoredSideNavCollapsed(
  storage: StorageLike | null | undefined,
) {
  try {
    const value = storage?.getItem(SIDE_NAV_COLLAPSED_KEY);

    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }
  } catch {
    return null;
  }

  return null;
}

export function writeStoredSideNavCollapsed(
  storage: StorageLike | null | undefined,
  isCollapsed: boolean,
) {
  try {
    storage?.setItem(SIDE_NAV_COLLAPSED_KEY, String(isCollapsed));
  } catch {
    // Storage may be unavailable in private windows, SSR, or embedded webviews.
  }
}
