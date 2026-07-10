import type {
  CompiledStyles,
  InlineStyles,
  StyleXArray,
} from "@stylexjs/stylex";
import * as stylex from "@stylexjs/stylex";

type StyleArg = StyleXArray<
  | null
  | undefined
  | CompiledStyles
  | boolean
  | Readonly<[CompiledStyles, InlineStyles]>
>;

export function sx(...compiledStyles: StyleArg[]) {
  return stylex.props(...compiledStyles).className ?? "";
}

export const settingsStyles = stylex.create({
  page: {
    minWidth: 0,
    minHeight: 0,
  },
  header: {
    justifyContent: "space-between",
  },
  search: {
    maxWidth: "min(100%, 360px)",
  },
  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
    gap: "var(--spacing-4)",
  },
  section: {
    minWidth: 0,
  },
  row: {
    paddingBlock: "var(--spacing-3)",
    borderTopWidth: "var(--border-width)",
    borderTopStyle: "solid",
    borderTopColor: "var(--color-border-secondary)",
  },
  rowMeta: {
    minWidth: 0,
    flex: 1,
  },
  statusBox: {
    padding: "var(--spacing-2)",
    borderRadius: "var(--radius-element)",
    backgroundColor: "var(--color-background-secondary)",
  },
  successBox: {
    backgroundColor: "var(--color-background-green)",
    color: "var(--color-text-green)",
  },
  errorBox: {
    backgroundColor: "var(--color-background-red)",
    color: "var(--color-text-red)",
  },
});
