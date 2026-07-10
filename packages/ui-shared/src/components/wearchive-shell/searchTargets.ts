export const SEARCH_TARGET_ATTRIBUTE = "data-wearchive-search-target";

export function getSearchTargetProps(
  label: string,
  options?: { preserveTabIndex?: boolean },
) {
  return {
    [SEARCH_TARGET_ATTRIBUTE]: label,
    ...(options?.preserveTabIndex ? {} : { tabIndex: -1 }),
  };
}

export function focusFirstSearchTarget(
  root: Document | HTMLElement,
  query: string,
) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return false;
  }

  const targets = root.querySelectorAll<HTMLElement>(
    `[${SEARCH_TARGET_ATTRIBUTE}]`,
  );

  for (const target of targets) {
    const searchableText =
      target.getAttribute(SEARCH_TARGET_ATTRIBUTE) || target.textContent || "";

    if (searchableText.toLowerCase().includes(normalizedQuery)) {
      target.focus({ preventScroll: true });
      target.scrollIntoView?.({ block: "nearest", inline: "nearest" });
      return true;
    }
  }

  return false;
}

export function countSearchTargets(
  root: Document | HTMLElement,
  query: string,
) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return null;
  }

  return Array.from(
    root.querySelectorAll<HTMLElement>(`[${SEARCH_TARGET_ATTRIBUTE}]`),
  ).filter((target) => {
    const searchableText =
      target.getAttribute(SEARCH_TARGET_ATTRIBUTE) || target.textContent || "";

    return searchableText.toLowerCase().includes(normalizedQuery);
  }).length;
}
