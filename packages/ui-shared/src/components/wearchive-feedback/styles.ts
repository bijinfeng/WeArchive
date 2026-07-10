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

export const feedbackStyles = stylex.create({
  disabledReason: {
    minWidth: 0,
    padding: "var(--spacing-3)",
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border-orange)",
    borderRadius: "var(--radius-element)",
    backgroundColor: "var(--color-background-orange)",
  },
  disabledReasonIcon: {
    color: "var(--color-icon-orange)",
    flexShrink: 0,
  },
  disabledReasonText: {
    minWidth: 0,
  },
  drawerContent: {
    minHeight: 0,
  },
  drawerFooter: {
    justifyContent: "flex-end",
  },
});
