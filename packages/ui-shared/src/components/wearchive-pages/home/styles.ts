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

export const homeStyles = stylex.create({
  page: {
    minHeight: "100%",
    padding: "var(--spacing-5)",
  },
  header: {
    justifyContent: "space-between",
  },
  headerTitle: {
    minWidth: 0,
  },
  summaryHero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: "var(--spacing-4)",
    alignItems: "start",
    backgroundImage:
      "linear-gradient(135deg, var(--color-background-card), var(--color-background-body))",
    "@media (max-width: 720px)": {
      gridTemplateColumns: "1fr",
    },
  },
  summaryActions: {
    justifyContent: "flex-end",
    flexWrap: "wrap",
    "@media (max-width: 720px)": {
      justifyContent: "flex-start",
    },
  },
  summaryMeta: {
    flexWrap: "wrap",
  },
  accountConsole: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 360px)",
    padding: 0,
    "@media (max-width: 980px)": {
      gridTemplateColumns: "1fr",
    },
  },
  identityPanel: {
    padding: "var(--spacing-5)",
    backgroundImage:
      "linear-gradient(180deg, var(--color-background-card), var(--color-background-body))",
  },
  identityHead: {
    minWidth: 0,
  },
  avatarHero: {
    width: "calc(var(--spacing-12) + var(--spacing-5))",
    height: "calc(var(--spacing-12) + var(--spacing-5))",
    borderRadius: "var(--radius-container)",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    backgroundColor: "var(--color-accent)",
    color: "var(--color-on-accent)",
    boxShadow: "var(--shadow-med)",
  },
  scopeNote: {
    display: "grid",
    gridTemplateColumns: "112px minmax(0, 1fr)",
    gap: "var(--spacing-3)",
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border)",
    borderRadius: "var(--radius-element)",
    backgroundColor: "var(--color-background-card)",
    padding: "var(--spacing-3)",
    "@media (max-width: 640px)": {
      gridTemplateColumns: "1fr",
    },
  },
  metricStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    overflow: "hidden",
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border)",
    borderRadius: "var(--radius-element)",
    backgroundColor: "var(--color-background-card)",
    "@media (max-width: 640px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
  },
  metricStripItem: {
    minWidth: 0,
    padding: "var(--spacing-3)",
    borderInlineEndWidth: "var(--border-width)",
    borderInlineEndStyle: "solid",
    borderInlineEndColor: "var(--color-border)",
  },
  identityActions: {
    flexWrap: "wrap",
  },
  accountRail: {
    minWidth: 0,
    borderInlineStartWidth: "var(--border-width)",
    borderInlineStartStyle: "solid",
    borderInlineStartColor: "var(--color-border)",
    backgroundColor: "var(--color-background-body)",
    padding: "var(--spacing-4)",
    "@media (max-width: 980px)": {
      borderInlineStartWidth: 0,
      borderBlockStartWidth: "var(--border-width)",
      borderBlockStartStyle: "solid",
      borderBlockStartColor: "var(--color-border)",
    },
  },
  accountRow: {
    width: "100%",
    minWidth: 0,
    justifyContent: "space-between",
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border-emphasized)",
    borderRadius: "var(--radius-element)",
    backgroundColor: "var(--color-background-card)",
    padding: "var(--spacing-2)",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
    gap: "var(--spacing-3)",
    "@media (max-width: 1280px)": {
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    },
    "@media (max-width: 640px)": {
      gridTemplateColumns: "1fr",
    },
  },
  kpiButton: {
    width: "100%",
    minHeight: "calc(var(--spacing-12) * 2)",
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    textAlign: "start",
    font: "inherit",
    color: "var(--color-text-primary)",
    cursor: "pointer",
    transitionProperty: "border-color, box-shadow, transform",
    transitionDuration: "var(--duration-fast)",
    ":hover": {
      "@media (hover: hover)": {
        borderColor: "var(--color-border-green)",
        boxShadow: "var(--shadow-inset-selected)",
      },
    },
    ":active": {
      transform: "scale(0.99)",
    },
  },
  homeGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "var(--spacing-4)",
    "@media (max-width: 980px)": {
      gridTemplateColumns: "1fr",
    },
  },
  taskRow: {
    width: "100%",
    minWidth: 0,
    justifyContent: "space-between",
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border)",
    borderRadius: "var(--radius-element)",
    backgroundColor: "var(--color-background-card)",
    padding: "var(--spacing-3)",
  },
  issueRow: {
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border-orange)",
    borderRadius: "var(--radius-element)",
    backgroundColor: "var(--color-background-orange)",
    padding: "var(--spacing-3)",
  },
  quickActionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "var(--spacing-3)",
    "@media (max-width: 640px)": {
      gridTemplateColumns: "1fr",
    },
  },
  quickAction: {
    minHeight: "calc(var(--spacing-12) * 1.6)",
    justifyContent: "flex-start",
    textAlign: "start",
  },
  skeletonLine: {
    maxWidth: "100%",
  },
});
