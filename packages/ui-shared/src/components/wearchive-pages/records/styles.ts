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

export const recordsStyles = stylex.create({
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
  layout: {
    display: "grid",
    gridTemplateColumns:
      "calc(var(--spacing-12) * 6 + var(--spacing-8)) minmax(0, 1fr) calc(var(--spacing-12) * 6)",
    minHeight: "calc(var(--spacing-12) * 13 + var(--spacing-6))",
    overflow: "hidden",
    "@media (max-width: 1080px)": {
      gridTemplateColumns:
        "calc(var(--spacing-12) * 6 + var(--spacing-3)) minmax(0, 1fr)",
    },
    "@media (max-width: 860px)": {
      display: "flex",
      flexDirection: "column",
      gridTemplateColumns: "1fr",
      minHeight: "auto",
      overflow: "visible",
    },
  },
  hiddenOnMedium: {
    "@media (max-width: 1080px)": {
      display: "none",
    },
  },
  hiddenOnSmall: {
    "@media (max-width: 860px)": {
      display: "none",
    },
  },
  conversationPane: {
    minWidth: 0,
    minHeight: 0,
    borderInlineEndWidth: "var(--border-width)",
    borderInlineEndStyle: "solid",
    borderInlineEndColor: "var(--color-border)",
    backgroundColor: "var(--color-background-body)",
    padding: "var(--spacing-3)",
    "@media (max-width: 860px)": {
      borderInlineEndWidth: 0,
      borderBlockEndWidth: "var(--border-width)",
      borderBlockEndStyle: "solid",
      borderBlockEndColor: "var(--color-border)",
    },
  },
  searchInput: {
    width: "100%",
    height: "var(--size-element-md)",
    minWidth: 0,
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border)",
    borderRadius: "var(--radius-element)",
    backgroundColor: "var(--color-background-card)",
    color: "var(--color-text-primary)",
    font: "inherit",
    paddingInline: "var(--spacing-3)",
    outlineColor: "var(--color-accent)",
  },
  filterRow: {
    flexWrap: "wrap",
  },
  conversationList: {
    minHeight: 0,
    overflow: "auto",
  },
  conversationRow: {
    width: "100%",
    minHeight: "calc(var(--spacing-12) + var(--spacing-8))",
    display: "grid",
    gridTemplateColumns: "calc(var(--spacing-10)) minmax(0, 1fr) auto",
    gap: "var(--spacing-3)",
    alignItems: "center",
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "transparent",
    borderRadius: "var(--radius-element)",
    backgroundColor: "transparent",
    color: "var(--color-text-primary)",
    cursor: "pointer",
    textAlign: "start",
    font: "inherit",
    padding: "var(--spacing-2)",
    transitionProperty: "background-color, border-color, box-shadow",
    transitionDuration: "var(--duration-fast)",
    ":hover": {
      "@media (hover: hover)": {
        backgroundColor: "var(--color-background-card)",
        borderColor: "var(--color-border)",
      },
    },
  },
  conversationRowSelected: {
    backgroundColor: "var(--color-background-card)",
    borderColor: "var(--color-border-green)",
    boxShadow: "var(--shadow-inset-selected)",
  },
  conversationRowBatch: {
    gridTemplateColumns:
      "var(--size-element-sm) calc(var(--spacing-10)) minmax(0, 1fr) auto",
  },
  selectionBox: {
    width: "var(--spacing-4)",
    height: "var(--spacing-4)",
    accentColor: "var(--color-accent)",
  },
  avatar: {
    width: "var(--spacing-10)",
    height: "var(--spacing-10)",
    borderRadius: "var(--radius-element)",
    display: "grid",
    placeItems: "center",
    backgroundColor: "var(--color-background-inverted)",
    color: "var(--color-background-surface)",
    fontWeight: "var(--font-weight-semibold)",
    flexShrink: 0,
  },
  rowMeta: {
    minWidth: 0,
  },
  rowEnd: {
    alignItems: "flex-end",
  },
  batchBar: {
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border-blue)",
    borderRadius: "var(--radius-element)",
    backgroundColor: "var(--color-background-blue)",
    padding: "var(--spacing-3)",
  },
  batchActions: {
    flexWrap: "wrap",
  },
  messagePane: {
    minWidth: 0,
    minHeight: 0,
    display: "grid",
    gridTemplateRows: "auto minmax(0, 1fr) auto",
    backgroundColor: "var(--color-background-card)",
    "@media (max-width: 860px)": {
      minHeight: "calc(var(--spacing-12) * 10)",
    },
  },
  paneHeader: {
    justifyContent: "space-between",
    borderBlockEndWidth: "var(--border-width)",
    borderBlockEndStyle: "solid",
    borderBlockEndColor: "var(--color-border)",
    padding: "var(--spacing-4)",
  },
  messageList: {
    minHeight: 0,
    overflow: "auto",
    padding: "var(--spacing-4)",
    backgroundImage:
      "linear-gradient(180deg, var(--color-background-card), var(--color-background-body))",
  },
  messageRow: {
    maxWidth: "min(72%, calc(var(--spacing-12) * 9))",
    alignItems: "flex-start",
    "@media (max-width: 860px)": {
      maxWidth: "100%",
    },
  },
  messageRowOwn: {
    justifySelf: "end",
  },
  bubble: {
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border)",
    borderRadius: "var(--radius-chat)",
    backgroundColor: "var(--color-background-card)",
    padding: "var(--spacing-3)",
    boxShadow: "var(--shadow-low)",
  },
  bubbleOwn: {
    backgroundColor: "var(--color-accent-muted)",
    borderColor: "var(--color-border-green)",
  },
  systemMessage: {
    justifySelf: "center",
    borderRadius: "var(--radius-full)",
    backgroundColor: "var(--color-background-muted)",
    color: "var(--color-text-secondary)",
    paddingInline: "var(--spacing-3)",
    paddingBlock: "var(--spacing-1)",
  },
  attachment: {
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border)",
    borderRadius: "var(--radius-element)",
    backgroundColor: "var(--color-background-body)",
    padding: "var(--spacing-2)",
  },
  highlight: {
    backgroundColor: "var(--color-warning-muted)",
    color: "var(--color-text-primary)",
    borderRadius: "var(--radius-inner)",
    paddingInline: "var(--spacing-0-5)",
  },
  messageTools: {
    borderBlockStartWidth: "var(--border-width)",
    borderBlockStartStyle: "solid",
    borderBlockStartColor: "var(--color-border)",
    padding: "var(--spacing-3)",
  },
  readonlyInput: {
    flexGrow: 1,
    minWidth: 0,
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border)",
    borderRadius: "var(--radius-element)",
    backgroundColor: "var(--color-background-body)",
    padding: "var(--spacing-2)",
  },
  detailPane: {
    minWidth: 0,
    minHeight: 0,
    overflow: "auto",
    borderInlineStartWidth: "var(--border-width)",
    borderInlineStartStyle: "solid",
    borderInlineStartColor: "var(--color-border)",
    backgroundColor: "var(--color-background-body)",
    padding: "var(--spacing-4)",
  },
  kvGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "var(--spacing-2)",
  },
  kvRow: {
    width: "100%",
    justifyContent: "space-between",
    borderBlockEndWidth: "var(--border-width)",
    borderBlockEndStyle: "solid",
    borderBlockEndColor: "var(--color-border)",
    paddingBlockEnd: "var(--spacing-2)",
  },
  riskNotice: {
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
