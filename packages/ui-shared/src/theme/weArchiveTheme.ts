import { defineTheme } from "@astryxdesign/core/theme";

export const weArchiveTheme = defineTheme({
  name: "wearchive",
  color: {
    accent: "#07C160",
    neutralStyle: "cool",
    contrast: "standard",
  },
  typography: {
    scale: {
      base: 13.5,
      ratio: 1.2,
    },
  },
  radius: {
    base: 4,
    multiplier: 1,
  },
  motion: {
    fast: 140,
    medium: 220,
    slow: 360,
    ratio: 0.75,
    easing: "cubic-bezier(0.24, 1, 0.4, 1)",
  },
  tokens: {
    "--color-accent": ["#07C160", "#39D978"],
    "--color-accent-muted": ["#E6F8EE", "#0B2F1A"],
    "--color-on-accent": "#FFFFFF",
    "--color-neutral": ["rgba(237, 241, 244, 0.95)", "rgba(34, 48, 61, 0.95)"],
    "--color-background-surface": ["#FBFCFD", "#101821"],
    "--color-background-body": ["#F7F8FA", "#121922"],
    "--color-background-muted": ["#EDF1F4", "#22303D"],
    "--color-background-card": ["#FFFFFF", "#17212B"],
    "--color-background-popover": ["#FFFFFF", "#17212B"],
    "--color-background-inverted": ["#101820", "#E9EFF6"],
    "--color-overlay": ["rgba(1, 18, 40, 0.40)", "rgba(0, 0, 0, 0.52)"],
    "--color-overlay-hover": [
      "rgba(5, 54, 89, 0.08)",
      "rgba(255, 255, 255, 0.08)",
    ],
    "--color-overlay-pressed": [
      "rgba(5, 54, 89, 0.14)",
      "rgba(255, 255, 255, 0.14)",
    ],
    "--color-text-primary": ["#12191F", "#E9EFF6"],
    "--color-text-secondary": ["#65717C", "#9AA8B6"],
    "--color-text-disabled": ["#8D98A3", "#738292"],
    "--color-text-accent": ["#07C160", "#39D978"],
    "--color-icon-primary": ["#12191F", "#E9EFF6"],
    "--color-icon-secondary": ["#65717C", "#9AA8B6"],
    "--color-icon-disabled": ["#8D98A3", "#738292"],
    "--color-icon-accent": ["#07C160", "#39D978"],
    "--color-success": ["#07C160", "#39D978"],
    "--color-success-muted": ["#E6F8EE", "#0B2F1A"],
    "--color-on-success": "#FFFFFF",
    "--color-warning": ["#8A5A13", "#F1C45C"],
    "--color-warning-muted": ["#FFF2D6", "#342813"],
    "--color-error": ["#B42318", "#FF8A7D"],
    "--color-error-muted": ["#FEE4E2", "#351B1B"],
    "--color-border": ["#DDE3E8", "#2C3946"],
    "--color-border-emphasized": ["#CBD4DC", "#415160"],
    "--color-skeleton": ["#CBD4DC", "#415160"],
    "--color-track": ["#EDF1F4", "#22303D"],
    "--color-shadow": ["rgba(20, 31, 40, 0.16)", "rgba(0, 0, 0, 0.44)"],
    "--color-background-blue": ["#E8F1FB", "#102A44"],
    "--color-border-blue": ["#BAD4ED", "#284B6F"],
    "--color-icon-blue": ["#1D64A7", "#7CBDFF"],
    "--color-text-blue": ["#1D64A7", "#A3CBF3"],
    "--color-background-green": ["#E6F8EE", "#0B2F1A"],
    "--color-border-green": ["#8BE7B5", "#1F7A45"],
    "--color-icon-green": ["#07C160", "#39D978"],
    "--color-text-green": ["#07C160", "#8EF0B3"],
    "--color-background-orange": ["#FFF2D6", "#342813"],
    "--color-border-orange": ["#EFD49B", "#5F4A1E"],
    "--color-icon-orange": ["#8A5A13", "#F1C45C"],
    "--color-text-orange": ["#8A5A13", "#F1D38D"],
    "--color-background-red": ["#FEE4E2", "#351B1B"],
    "--color-border-red": ["#F1B5AE", "#6A2F2F"],
    "--color-icon-red": ["#B42318", "#FF8A7D"],
    "--color-text-red": ["#B42318", "#FFB0A7"],
    "--font-family-body":
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    "--font-family-heading":
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    "--font-family-code": '"SF Mono", Monaco, Consolas, monospace',
    "--size-element-sm": "28px",
    "--size-element-md": "34px",
    "--size-element-lg": "40px",
    "--radius-inner": "4px",
    "--radius-element": "8px",
    "--radius-container": "8px",
    "--radius-page": "18px",
    "--radius-chat": "8px",
    "--shadow-low": "0 1px 0 rgba(17, 24, 28, 0.02)",
    "--shadow-med":
      "0 10px 28px rgba(20, 31, 40, 0.06), 0 1px 3px rgba(20, 31, 40, 0.08)",
    "--shadow-high":
      "0 24px 70px light-dark(rgba(20, 31, 40, 0.16), rgba(0, 0, 0, 0.44)), 0 2px 12px light-dark(rgba(20, 31, 40, 0.08), rgba(0, 0, 0, 0.34))",
    "--shadow-inset-hover":
      "inset 0 0 0 2px light-dark(rgba(5, 54, 89, 0.12), rgba(255, 255, 255, 0.12))",
    "--shadow-inset-selected":
      "0 0 0 3px light-dark(rgba(7, 193, 96, 0.12), rgba(57, 217, 120, 0.18))",
  },
  components: {
    button: {
      base: {
        borderRadius: "var(--radius-element)",
        fontWeight: "720",
      },
      "variant:primary": {
        backgroundColor: "var(--color-accent)",
        color: "var(--color-on-accent)",
      },
      "variant:ghost": {
        color: "var(--color-text-primary)",
      },
      "variant:secondary": {
        backgroundColor: "var(--color-background-muted)",
        color: "var(--color-text-primary)",
      },
    },
    navicon: {
      base: {
        backgroundColor: "var(--color-accent)",
        color: "var(--color-on-accent)",
      },
    },
    "side-nav-item": {
      "selected:selected": {
        "--color-icon-primary": "var(--color-icon-accent)",
        backgroundColor: "var(--color-accent-muted)",
        boxShadow: "inset 3px 0 0 var(--color-accent)",
        color: "var(--color-text-accent)",
        ":hover": {
          backgroundColor: "var(--color-accent-muted)",
        },
        ":active": {
          backgroundColor: "var(--color-accent-muted)",
        },
      },
    },
    textinput: {
      base: {
        borderRadius: "var(--radius-element)",
        backgroundColor: "var(--color-background-body)",
        borderColor: "var(--color-border)",
      },
    },
    card: {
      base: {
        borderRadius: "var(--radius-element)",
        backgroundColor: "var(--color-background-card)",
        borderColor: "var(--color-border)",
      },
    },
  },
});
