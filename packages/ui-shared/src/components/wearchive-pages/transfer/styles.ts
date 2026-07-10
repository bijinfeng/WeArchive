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

export const transferStyles = stylex.create({
  page: {
    minHeight: "100%",
    padding: "var(--spacing-5)",
  },
  header: {
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  title: {
    minWidth: 0,
  },
  frame: {
    display: "grid",
    gridTemplateColumns:
      "calc(var(--spacing-12) * 4) minmax(0, 1fr) calc(var(--spacing-12) * 6)",
    gap: "var(--spacing-4)",
    alignItems: "stretch",
    minWidth: 0,
    "@media (max-width: 1180px)": {
      gridTemplateColumns: "calc(var(--spacing-12) * 4) minmax(0, 1fr)",
    },
    "@media (max-width: 820px)": {
      gridTemplateColumns: "1fr",
    },
  },
  panel: {
    minWidth: 0,
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border)",
    borderRadius: "var(--radius-container)",
    backgroundColor: "var(--color-background-card)",
    padding: "var(--spacing-4)",
  },
  previewPanel: {
    "@media (max-width: 1180px)": {
      gridColumn: "1 / -1",
    },
  },
  stepRow: {
    minWidth: 0,
    paddingBlock: "var(--spacing-2)",
    borderBlockEndWidth: "var(--border-width)",
    borderBlockEndStyle: "solid",
    borderBlockEndColor: "var(--color-border)",
  },
  optionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "var(--spacing-3)",
    "@media (max-width: 680px)": {
      gridTemplateColumns: "1fr",
    },
  },
  optionCard: {
    alignItems: "flex-start",
    minHeight: "calc(var(--spacing-12) * 2)",
  },
  infoBox: {
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border)",
    borderRadius: "var(--radius-element)",
    backgroundColor: "var(--color-background-body)",
    padding: "var(--spacing-3)",
  },
  warningBox: {
    borderColor: "var(--color-border-orange)",
    backgroundColor: "var(--color-background-orange)",
  },
  successBox: {
    borderColor: "var(--color-border-green)",
    backgroundColor: "var(--color-background-green)",
  },
  toolbar: {
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  checkboxGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "var(--spacing-2)",
    "@media (max-width: 560px)": {
      gridTemplateColumns: "1fr",
    },
  },
  kvGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "var(--spacing-2)",
  },
  queue: {
    minWidth: 0,
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border)",
    borderRadius: "var(--radius-container)",
    backgroundColor: "var(--color-background-card)",
    overflow: "hidden",
  },
  queueHeader: {
    justifyContent: "space-between",
    padding: "var(--spacing-4)",
    borderBlockEndWidth: "var(--border-width)",
    borderBlockEndStyle: "solid",
    borderBlockEndColor: "var(--color-border)",
  },
  queueRow: {
    minWidth: 0,
    paddingInline: "var(--spacing-4)",
    paddingBlock: "var(--spacing-3)",
  },
  rowMeta: {
    minWidth: 0,
    flexWrap: "wrap",
  },
  actions: {
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
});
