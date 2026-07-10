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

export const taskStyles = stylex.create({
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
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "var(--spacing-3)",
    "@media (max-width: 980px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
    "@media (max-width: 560px)": {
      gridTemplateColumns: "1fr",
    },
  },
  summaryCard: {
    minWidth: 0,
  },
  board: {
    minWidth: 0,
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border)",
    borderRadius: "var(--radius-container)",
    backgroundColor: "var(--color-background-card)",
    overflow: "hidden",
  },
  boardHeader: {
    justifyContent: "space-between",
    borderBlockEndWidth: "var(--border-width)",
    borderBlockEndStyle: "solid",
    borderBlockEndColor: "var(--color-border)",
    padding: "var(--spacing-4)",
    flexWrap: "wrap",
  },
  row: {
    width: "100%",
    minWidth: 0,
    paddingInline: "var(--spacing-4)",
    paddingBlock: "var(--spacing-3)",
    borderRadius: "var(--radius-inner)",
  },
  rowBody: {
    minWidth: 0,
  },
  rowHeader: {
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  rowMeta: {
    minWidth: 0,
    flexWrap: "wrap",
  },
  singleLineText: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  multiLineText: {
    overflow: "hidden",
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
  },
  actionGroup: {
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
  progressArea: {
    minWidth: 0,
  },
  kvGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "var(--spacing-2)",
    "@media (max-width: 640px)": {
      gridTemplateColumns: "1fr",
    },
  },
  kvItem: {
    minWidth: 0,
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border)",
    borderRadius: "var(--radius-element)",
    backgroundColor: "var(--color-background-body)",
    padding: "var(--spacing-3)",
  },
  detailSection: {
    minWidth: 0,
  },
  logActions: {
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  logRow: {
    minWidth: 0,
  },
  notice: {
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border-orange)",
    borderRadius: "var(--radius-element)",
    backgroundColor: "var(--color-background-orange)",
    padding: "var(--spacing-3)",
  },
  empty: {
    minHeight: "calc(var(--spacing-12) * 6)",
    display: "grid",
    placeItems: "center",
    padding: "var(--spacing-5)",
  },
});
