# WeArchive shared core/UI and fnOS native technical design

Date: 2026-07-09
Status: active implementation baseline

## Goals

- Restore the desktop and fnOS frontend from the approved WeArchive UI direction without maintaining parallel UI implementations.
- Keep platform packages thin: desktop owns Electron bridges and native window behavior; fnOS owns package layout, HTTP routes, and NAS runtime integration.
- Move reusable domain types, database contracts, services, and presentation shell code into shared packages.
- Keep shared dependency versions centralized in pnpm catalogs.

## Package Boundaries

### `packages/core`

Shared domain and data layer.

- Database connection, schema, and FTS setup.
- Domain models for accounts, conversations, messages, attachments, backup tasks, shell runtime, and overview stats.
- Cross-platform services for filesystem, logging, search, and task scheduling.
- Formatting, error, and overview normalization utilities.

Consumers should import from `@we-archive/core`, `@we-archive/core/database`, `@we-archive/core/services`, `@we-archive/core/types`, or `@we-archive/core/utils`.

### `packages/ui-shared`

Shared React UI layer.

- Owns the shared `WeArchiveShell` used by desktop and fnOS.
- Owns shared UI hooks, API adapter contracts, stores, and UI utilities.
- Uses Astryx components first and StyleX for custom styles.
- Does not own Electron, fnOS, or browser runtime behavior.

Platform packages pass runtime metadata, navigation state, and API adapter implementations into the shared UI.

### `packages/desktop`

Electron adapter.

- Owns main process bootstrap, window options, IPC handlers, preload API, and Electron-specific platform behavior.
- Uses native macOS traffic lights.
- Uses custom Windows window controls through the shared shell and IPC window actions.
- Renderer pages are route-level adapters; the app shell and reusable presentation live in `packages/ui-shared`.

### `packages/fnos-native`

fnOS native package adapter.

- Follows the official Native example shape: `backend/`, root-level frontend build config, `frontend/src`, package scripts, and `wearchive/` app package metadata.
- `frontend/` intentionally has no `package.json`, `tsconfig`, or Vite config.
- Backend routes serve the built UI and app APIs from the fnOS package.
- Generated package server output is ignored and rebuilt by package scripts.

## Dependency Rules

- Shared dependency versions live in `pnpm-workspace.yaml` catalogs.
- Package manifests use `catalog:<name>` for shared libraries and tooling versions.
- Workspace packages use `workspace:*`.
- New cross-package dependencies should be added to catalogs before package manifests reference them.

## Styling Rules

- Use Astryx components for layout, navigation, controls, status, and common UI patterns.
- Use StyleX for custom component styles.
- Use Astryx tokens and CSS variables inside StyleX values.
- Do not add local CSS modules or Tailwind-style utility classes for shared UI.

## Build And Verification

Expected focused checks:

- `pnpm --dir packages/core type-check`
- `pnpm --dir packages/ui-shared type-check`
- `pnpm --dir packages/fnos-native type-check`
- `pnpm --dir packages/desktop type-check`
- `pnpm exec biome check`
- `pnpm --dir packages/fnos-native build:fnos`
- `pnpm --dir packages/desktop exec electron-vite build`

The current implementation consumes `packages/core` as a workspace TypeScript source package. Do not add a separate core build step unless the package is converted fully to a built-library contract and verified across desktop, fnOS, and shared UI consumers.
