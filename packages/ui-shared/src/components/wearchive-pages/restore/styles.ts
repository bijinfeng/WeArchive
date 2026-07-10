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

export const restoreStyles = stylex.create({
  page: {
    minWidth: 0,
    minHeight: 0,
  },
  frame: {
    display: "grid",
    gridTemplateColumns:
      "minmax(260px, 340px) minmax(0, 1fr) minmax(260px, 320px)",
    gap: "var(--spacing-4)",
    alignItems: "start",
    "@media (max-width: 1040px)": {
      gridTemplateColumns: "minmax(0, 1fr)",
    },
  },
  panel: {
    minWidth: 0,
  },
  row: {
    padding: "var(--spacing-3)",
    borderRadius: "var(--radius-element)",
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border-secondary)",
    backgroundColor: "var(--color-background-primary)",
  },
  rowActive: {
    borderColor: "var(--color-border-green)",
    backgroundColor: "var(--color-background-green)",
  },
  riskBox: {
    padding: "var(--spacing-3)",
    borderRadius: "var(--radius-element)",
    backgroundColor: "var(--color-background-orange)",
  },
});
