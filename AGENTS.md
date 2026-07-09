# AGENTS

Project-specific guidance for AI coding agents.

## Project architecture guardrails

- Shared dependency versions belong in `pnpm-workspace.yaml` catalogs. If a dependency is shared by multiple packages, shared UI, build tooling, or platform targets, package manifests should reference it with `catalog:<name>` instead of maintaining hardcoded duplicate versions.
- Shared domain/core code belongs in `packages/core`. Data models, shared types, database schema, business services, task logic, parsing/formatting utilities, and cross-platform contracts should be implemented once in core and consumed by desktop, fnOS, and shared UI packages instead of being duplicated locally.
- Shared UI belongs in `packages/ui-shared`. Desktop, fnOS, and other platform packages should be thin adapters for routing, data access, native bridges, and runtime-specific behavior; they should not maintain parallel copies of app shell, navigation, layout, or reusable presentation components.
- Componentize and reuse before adding new code. Search existing components, hooks, utilities, and Astryx templates first; extract a shared component or helper when the same UI or behavior is needed across packages.
- Styling should be written with StyleX for custom styles. Prefer Astryx component props and design tokens first; when custom styles are required, use StyleX with tokens instead of raw CSS, inline styles, Tailwind-style utility classes, or hardcoded colors/spacing.
- fnOS native work should follow the official Native example structure: keep `backend/` as the backend folder, keep frontend source independent but without its own `package.json`, `tsconfig`, or Vite config, and keep build/config ownership at the package root and generated app package directory.

<!-- ASTRYX:START -->
Astryx v0.1.3 · 149 components
CLI: run every command as `pnpm exec astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in your app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — discover, don't guess. Before writing UI:
1. `astryx build "<idea>"` — START HERE: returns a kit (closest [page] + [block]s + [component]s). No args = full playbook.
2. `astryx template <name> [--skeleton]` — scaffold the [page]/[block]s it named, or study their layout. Templates are reference code.
3. `astryx component <Name>` — props + examples for every component you use.

RULES:
- No <div> — components do all layout/spacing. Full page → AppShell; sidebar nav → SideNav.
- Frame first: pick the shell (AppShell / Layout+LayoutPanel) and budget regions in px BEFORE writing content (`astryx docs layout`).
- Dense data = rows (Table, List/Item) edge-to-edge — never Card-wrapped list items. Card = dashboard widgets, galleries, settings groups only.
- Status → StatusDot/Token; Badge only for counts and enumerated states, never decoration.
- Custom styling: component props first; else StyleX styles with tokens — var(--color-*|--spacing-*|--radius-*). No raw hex/px, inline style objects, raw CSS modules for component styling, or Tailwind-style utility classes.
- Tokens for every value (`astryx docs tokens`). Brand/accent via `astryx theme` — never override --color-* in :root.

MORE CLI:
  search "<query>"   find any component / hook / doc / template / block
  component --list   149 components by category
  template --list    page + block recipes
  docs <topic>       color, elevation, icons, illustrations, layout, migration, motion, principles, shape, spacing, styling, theme, tokens, typography
  swizzle <Name>     eject component source for deep customization
  upgrade --apply    run after any @astryxdesign/core bump
<!-- ASTRYX:END -->
