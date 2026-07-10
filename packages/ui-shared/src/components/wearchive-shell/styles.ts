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

export const styles = stylex.create({
  stage: {
    minWidth: 0,
    minHeight: "100dvh",
    height: "100dvh",
    overflow: "hidden",
  },
  embeddedStage: {
    backgroundColor: "var(--color-background-body)",
  },
  desktopStage: {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100dvh",
    backgroundColor: "var(--color-background-body)",
    backgroundImage:
      "linear-gradient(135deg, var(--color-background-muted), var(--color-background-body) 58%, var(--color-border))",
  },
  window: {
    minWidth: 0,
    minHeight: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border-emphasized)",
    borderRadius: "var(--radius-page)",
    backgroundColor: "var(--color-background-surface)",
    boxShadow: "var(--shadow-high)",
  },
  desktopWindow: {
    borderWidth: 0,
    borderRadius: "var(--radius-none)",
    boxShadow: "none",
  },
  embeddedWindow: {
    borderWidth: 0,
    borderRadius: "var(--radius-none)",
    boxShadow: "none",
  },
  shell: {
    minWidth: 0,
    minHeight: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "var(--color-background-surface)",
  },
  topNav: {
    minHeight: "calc(var(--spacing-12) + var(--spacing-1-5))",
    borderBottomWidth: "var(--border-width)",
    borderBottomStyle: "solid",
    borderBottomColor: "var(--color-border)",
    backgroundColor:
      "color-mix(in srgb, var(--color-background-surface) 96%, transparent)",
  },
  desktopTopNav: {
    WebkitAppRegion: "drag",
  },
  headerControl: {
    WebkitAppRegion: "no-drag",
  },
  sidebarToggle: {
    width: "var(--size-element-md)",
    height: "var(--size-element-md)",
    borderRadius: "var(--radius-element)",
    color: {
      default: "var(--color-icon-secondary)",
      ":hover": {
        "@media (hover: hover)": "var(--color-icon-primary)",
      },
      ":focus-visible": "var(--color-icon-primary)",
    },
    backgroundColor: {
      default: null,
      ":hover": {
        "@media (hover: hover)": "var(--color-overlay-hover)",
      },
      ":focus-visible": "var(--color-overlay-hover)",
    },
    boxShadow: {
      default: null,
      ":hover": {
        "@media (hover: hover)": "var(--shadow-inset-hover)",
      },
      ":focus-visible": "var(--shadow-inset-selected)",
    },
    transitionProperty: "background-color, color, box-shadow",
    transitionDuration: {
      default: "var(--duration-fast)",
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    transitionTimingFunction: "var(--ease-standard)",
  },
  titleStart: {
    minWidth: "calc(var(--spacing-12) * 4)",
  },
  singleLineText: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  nativeTrafficSpace: {
    width: "calc(var(--spacing-12) + var(--spacing-8))",
    height: "var(--spacing-3)",
    flexShrink: 0,
  },
  searchCluster: {
    minWidth: 0,
  },
  topActions: {
    height: "100%",
    whiteSpace: "nowrap",
  },
  backupAction: {
    backgroundColor: "var(--color-success)",
    color: "var(--color-on-success)",
    WebkitAppRegion: "no-drag",
    ":hover": {
      backgroundColor:
        "color-mix(in srgb, var(--color-success) 88%, var(--color-on-light))",
    },
  },
  windowControls: {
    height: "100%",
    marginInlineStart: "var(--spacing-1)",
    WebkitAppRegion: "no-drag",
  },
  windowControl: {
    width: "var(--spacing-11)",
    height: "100%",
    borderRadius: "var(--radius-none)",
  },
  windowControlClose: {
    ":hover": {
      backgroundColor: "var(--color-error)",
      color: "var(--color-on-error)",
    },
  },
  sideNav: {
    minWidth: 0,
    minHeight: 0,
    height: "100%",
    overflowX: "hidden",
    backgroundColor: "var(--color-background-surface)",
  },
  desktopSideNav: {
    height: "calc(100dvh - calc(var(--spacing-12) + var(--spacing-1-5)))",
  },
  brandMark: {
    borderRadius: "var(--radius-element)",
    backgroundColor: "var(--color-accent)",
    color: "var(--color-on-accent)",
  },
  main: {
    minHeight: 0,
    height: "100%",
    overflow: "auto",
    backgroundColor: "var(--color-background-body)",
  },
  desktopMain: {
    height: "calc(100dvh - calc(var(--spacing-12) + var(--spacing-1-5)))",
  },
  content: {
    minHeight: "100%",
    padding: "var(--spacing-5)",
  },
  contentHeader: {
    justifyContent: "space-between",
  },
  contentTitle: {
    minWidth: 0,
  },
  notice: {
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border-emphasized)",
    borderRadius: "var(--radius-element)",
    backgroundColor: "var(--color-background-card)",
  },
  metricGrid: {
    width: "100%",
    minWidth: 0,
    flexWrap: "wrap",
  },
  metricCard: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: "calc(var(--spacing-12) * 3)",
    padding: "var(--spacing-4)",
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border)",
    borderRadius: "var(--radius-element)",
    backgroundColor: "var(--color-background-card)",
  },
  workspace: {
    width: "100%",
    minWidth: 0,
    flexWrap: "wrap",
  },
  panel: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: "calc(var(--spacing-12) * 4)",
    padding: "var(--spacing-4)",
    borderWidth: "var(--border-width)",
    borderStyle: "solid",
    borderColor: "var(--color-border)",
    borderRadius: "var(--radius-element)",
    backgroundColor: "var(--color-background-card)",
  },
  taskRow: {
    minWidth: 0,
    paddingBlock: "var(--spacing-2)",
  },
  searchTarget: {
    borderRadius: "var(--radius-element)",
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: {
      default: 0,
      ":focus-visible": "calc(var(--border-width) * 2)",
    },
    outlineColor: {
      default: "transparent",
      ":focus-visible": "var(--color-accent)",
    },
    outlineOffset: {
      default: 0,
      ":focus-visible": "var(--spacing-0-5)",
    },
  },
});
