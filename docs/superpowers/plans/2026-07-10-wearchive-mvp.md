# WeArchive MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first usable WeArchive MVP from the PRD, approved product direction, technical design, and high-fidelity desktop design reference.

**Architecture:** Implement one shared product surface in `packages/ui-shared`, one shared archive/domain/API contract in `packages/core`, and thin adapters in `packages/desktop` and `packages/fnos-native`. The MVP should use a normalized fixture import path first, then render, search, manage tasks, and export from the standard archive model instead of from platform-local mocks.

**Tech Stack:** React 19, TanStack Query/Router, Astryx components, StyleX, Drizzle + better-sqlite3, Electron IPC, Fastify fnOS backend, pnpm catalogs.

---

## Authoritative Sources

- PRD: `docs/product/wechat-backup-prd.md`
- Approved product direction: `docs/product/wechat-archive-design-approved.md`
- Technical baseline: `docs/technical/shared-core-ui-and-fnos-native.md`
- Design reference: `docs/design/desktop-wechat-backup-rich-content-prd2.html`
- Theme and UI rules: `DESIGN.md`, `AGENTS.md`

## MVP Scope

MVP must include:

- Shared full-screen shell with stable top nav, collapsible side nav, current archive status strip, global search, and WeChat-green Astryx theme.
- Real navigation for 首页, 聊天记录, 备份任务, 导入导出, 恢复管理, 设置.
- A normalized Archive v0 fixture import path that creates accounts, contacts, conversations, messages, attachments, import jobs, task logs, and search index rows.
- 首页 dashboard matching the design reference structure: status summary, account console, KPI strip, recent tasks, issues, and quick actions.
- 聊天记录 page with three-pane desktop layout: conversation list, message stream, conversation detail panel, page search, batch selection, and export handoff.
- 备份任务 page with task list/board, pause/resume/cancel/retry state transitions, task detail drawer, and log filtering.
- 导入导出 workbench with import/export mode switch, stepper, work panel, preview/risk panel, bottom task queue, and full PRD demo paths using the normalized fixture and generated export artifacts.
- 恢复管理 MVP page with restore point list, restore point check, strategy/risk preview, and disabled destructive restore execution with an explicit reason.
- 设置 page with searchable setting sections, path checks, switch save feedback, and security/export defaults.
- Browser visual QA against the design reference at desktop and narrow widths.

MVP excludes:

- Real WeChat phone-to-desktop backup protocol acquisition.
- Destructive restore execution that overwrites existing archives.
- Full encryption-at-rest implementation.
- AI retrieval, knowledge-base features, cloud sync, auto-update, release packaging.
- Perfect media playback for all message types; unsupported media must render readable placeholders and retain raw payload.

## Current State Facts

- `packages/ui-shared` owns `WeArchiveShell`, top nav, side nav, overview shell styles, and the generated `wearchive` Astryx theme.
- `packages/desktop` route modules are currently empty adapters; desktop `AppShell` already renders the shared shell and maps routes to `WeArchiveViewId`.
- `packages/fnos-native/frontend/src/App.tsx` renders the shared shell with local state and HTTP overview calls.
- `packages/core` already contains initial account/conversation/message/attachment/task schema, search service, task scheduler, and overview types, but it lacks Archive v0 import/export contracts, contacts, import jobs, export jobs, task logs, restore points, and page-level repository APIs.
- `packages/desktop/src/main/services/MockDataService.ts` still owns platform-local mock data and duplicate renderer shared types exist in `packages/desktop/src/shared/types/index.ts`.
- `packages/fnos-native/backend/routes.ts` has HTTP endpoints with fallback data and an unimplemented backup start path.

## Astryx Component Contract

Use Astryx first, then StyleX with tokens for product-specific composition.

- Shell: `AppShell`, `TopNav`, `SideNav`, `Layout`, `LayoutContent`, `LayoutPanel`.
- Dense data: `Table`, `List`, `ListItem`, `Pagination`, row selection templates.
- Filters/search: `TextInput`, `Toolbar`, `Selector`, `PowerSearch` where it fits table-like data.
- Modes and settings: `SegmentedControl` if available from component docs; otherwise Astryx `Button` group with StyleX tokens.
- States: `Token`, `StatusDot`, `Badge` only for counts/enumerated states.
- Empty states: `EmptyState` templates.
- Feedback: Astryx `Toast` templates and a shared toast controller.
- Dialog/detail: Astryx dialog/drawer templates when available; if the exact component is unavailable, use `LayoutPanel`/popover-style Astryx primitives with StyleX tokens and PRD-compliant behavior.

Before implementing a UI task, run the closest Astryx discovery command and paste the result into the task notes:

```bash
pnpm exec astryx build "<page or interaction idea>"
pnpm exec astryx template <template-name> --skeleton
pnpm exec astryx docs layout
```

## File Structure Map

### Core

- Create `packages/core/src/archive/` for Archive v0 contracts, sample fixtures, import validation, export planning, and restore point planning.
- Create `packages/core/src/repositories/` for database-backed reads/writes used by both desktop IPC and fnOS HTTP.
- Create `packages/core/src/exporters/` for HTML/CSV/JSON MVP export generation.
- Extend `packages/core/src/database/schema.ts` with contacts, import jobs, export jobs, task logs, restore points, archive settings, and indexes.
- Extend `packages/core/src/types/` with page-level DTOs for home, conversations, messages, import/export, settings, restore points, and task details.

### Shared UI

- Keep `packages/ui-shared/src/components/WeArchiveShell.tsx` as the frame owner.
- Create `packages/ui-shared/src/components/wearchive-pages/` for page surfaces.
- Create `packages/ui-shared/src/components/wearchive-feedback/` for toast, drawer, confirm dialog, disabled-reason helpers, and empty-state wrappers.
- Create `packages/ui-shared/src/hooks/` page hooks that consume the shared `ApiAdapter`.
- Extend `packages/ui-shared/src/hooks/useApi.ts` rather than adding platform-local API calls.
- Keep all custom layout styles in StyleX files under the matching component folder.

### Desktop

- Replace `MockDataService` usage with core repositories and services.
- Keep Electron-only behavior in `packages/desktop/src/main/ipc/*`, preload, window controls, and file picker/permission bridges.
- Delete or stop importing duplicate platform-local shared types once core DTOs cover the renderer.
- Keep route modules thin; route modules should not duplicate shared page UI.

### fnOS Native

- Keep `backend/` as the backend folder and `frontend/` without its own package manifest/config.
- Implement HTTP routes as wrappers around the same core repositories/services as desktop.
- Keep the frontend as a thin shared UI host.

---

## Task 1: Archive v0 Domain, Schema, And Fixture Import Contract

**Purpose:** Establish the single data model that all pages, adapters, importers, exporters, and future AI references use.

**Files:**

- Modify: `packages/core/src/database/schema.ts`
- Modify: `packages/core/src/types/models.ts`
- Modify: `packages/core/src/types/task.ts`
- Modify: `packages/core/src/types/shell.ts`
- Modify: `packages/core/src/types/index.ts`
- Modify: `packages/core/src/index.ts`
- Create: `packages/core/src/archive/types.ts`
- Create: `packages/core/src/archive/fixtureArchive.ts`
- Create: `packages/core/src/archive/normalizedArchiveImporter.ts`
- Create: `packages/core/src/repositories/archiveRepository.ts`
- Create: `packages/core/src/repositories/index.ts`

- [x] Add schema tables for `archives`, `contacts`, `import_jobs`, `export_jobs`, `task_logs`, `restore_points`.
- [x] Add indexes for conversation account/type/date, message conversation/date/type/sender, attachment message/type/status, task status/date, import/export job status/date.
- [x] Extend `MessageType` to include PRD required placeholders: `location`, `contact-card`, `group-notice`, `merged`, `unknown`, `red-packet`.
- [x] Add `rawPayload`, `sourceId`, `sourceHash`, and `stableId` fields to import-facing DTOs.
- [x] Define `NormalizedArchiveInput` in `archive/types.ts` with accounts, contacts, conversations, messages, attachments, and source metadata.
- [x] Add a deterministic fixture in `fixtureArchive.ts` with at least 2 accounts, 10 conversations, 60 messages, 8 attachment records, 1 partial attachment warning, 1 unknown message type, and 3 task logs.
- [x] Implement `importNormalizedArchive(input)` that upserts fixture data into SQLite and returns counts: accounts, conversations, messages, attachments, duplicates, warnings, unknownTypes.
- [x] Export the new archive and repository modules from core entrypoints.
- [x] Verification:

```bash
pnpm --dir packages/core type-check
pnpm --filter @we-archive/core build
```

Expected: TypeScript passes and core dist exports include `@we-archive/core/archive` or the chosen root export path.

## Task 2: Core Repository APIs For Page Data

**Purpose:** Move page reads/writes out of desktop mocks and fnOS fallbacks into shared core services.

**Files:**

- Create: `packages/core/src/repositories/overviewRepository.ts`
- Create: `packages/core/src/repositories/conversationRepository.ts`
- Create: `packages/core/src/repositories/messageRepository.ts`
- Create: `packages/core/src/repositories/taskRepository.ts`
- Create: `packages/core/src/repositories/transferRepository.ts`
- Create: `packages/core/src/repositories/settingsRepository.ts`
- Create: `packages/core/src/repositories/restoreRepository.ts`
- Modify: `packages/core/src/services/SearchService.ts`
- Modify: `packages/core/src/services/TaskScheduler.ts`
- Modify: `packages/core/src/services/index.ts`

- [x] Add `getOverviewData()` returning account, stats, recent tasks, issues, and current archive status.
- [x] Add `listConversations({ query, type, backupStatus, hasAttachments, limit, offset })`.
- [x] Add `getConversationDetail(conversationId)` with metadata, risks, and quick-action eligibility.
- [x] Add `listMessages({ conversationId, query, messageType, cursor, limit })` with highlighted ranges or enough data for UI highlighting.
- [x] Add `listTasks()`, `pauseTask()`, `resumeTask()`, `cancelTask()`, `retryTask()`, `getTaskDetail()`, and `listTaskLogs()`.
- [x] Add import/export draft planning functions that calculate preview stats before writing data.
- [x] Add restore point list/check/strategy preview functions, with destructive execution returning a typed disabled reason in MVP.
- [x] Add settings read/write helpers with optimistic write support and rollback data.
- [x] Verification:

```bash
pnpm --dir packages/core type-check
pnpm --filter @we-archive/core build
```

Expected: Repository and service exports are consumable from a Node script without importing desktop or fnOS code.

## Task 3: Unified API Adapter Across Desktop And fnOS

**Purpose:** Give shared UI one stable API contract and keep platforms as thin transports.

**Files:**

- Modify: `packages/ui-shared/src/hooks/useApi.ts`
- Create: `packages/ui-shared/src/hooks/useWeArchiveData.ts`
- Modify: `packages/desktop/src/main/ipc/handlers.ts`
- Modify: `packages/desktop/src/preload/index.ts`
- Modify: `packages/desktop/src/preload/index.d.ts`
- Modify: `packages/desktop/src/renderer/src/api/adapter.ts`
- Modify: `packages/fnos-native/backend/routes.ts`
- Modify: `packages/fnos-native/frontend/src/api.ts`
- Modify: `packages/fnos-native/frontend/src/App.tsx`
- Remove after replacement: `packages/desktop/src/main/services/MockDataService.ts`
- Remove after replacement: `packages/desktop/src/shared/types/index.ts`

- [x] Expand `ApiAdapter` into domains: `overview`, `conversations`, `messages`, `tasks`, `transfer`, `settings`, `restore`, `file`.
- [x] Update Electron IPC channel names to mirror the adapter domains.
- [x] Update fnOS HTTP route paths to mirror the same domains.
- [x] Make desktop and fnOS call the same core repository/service functions.
- [x] Implement `startBackup` as a task creation path instead of a static response.
- [x] Add a dev-only seed/import endpoint or bootstrap action that imports the normalized fixture when no archive exists.
- [x] Verification:

```bash
pnpm --dir packages/ui-shared type-check
pnpm --dir packages/desktop type-check
pnpm --dir packages/fnos-native type-check
```

Expected: Shared UI compiles against one adapter contract; desktop and fnOS no longer depend on duplicate model types.

## Task 4: Shared Frame, Navigation, Search, And Feedback Primitives

**Purpose:** Make the global frame behave exactly like the PRD and design reference before filling every page.

**Files:**

- Modify: `packages/core/src/types/shell.ts`
- Modify: `packages/ui-shared/src/components/WeArchiveShell.tsx`
- Modify: `packages/ui-shared/src/components/wearchive-shell/constants.ts`
- Modify: `packages/ui-shared/src/components/wearchive-shell/WeArchiveTopNav.tsx`
- Modify: `packages/ui-shared/src/components/wearchive-shell/WeArchiveSideNav.tsx`
- Modify: `packages/ui-shared/src/components/wearchive-shell/styles.ts`
- Create: `packages/ui-shared/src/components/wearchive-feedback/ToastProvider.tsx`
- Create: `packages/ui-shared/src/components/wearchive-feedback/ConfirmDialog.tsx`
- Create: `packages/ui-shared/src/components/wearchive-feedback/DetailDrawer.tsx`
- Create: `packages/ui-shared/src/components/wearchive-feedback/DisabledReason.tsx`
- Create: `packages/ui-shared/src/components/wearchive-feedback/EmptyAction.tsx`

- [x] Extend `WeArchiveViewId` with `restore`.
- [x] Add side-nav item `恢复管理` and ensure all primary nav items switch real content.
- [x] Convert shell content rendering from always `OverviewPanel` to a page-slot renderer that receives active view, query, and action handlers.
- [x] Persist side-nav collapse state in shared state or local storage so route switches preserve it.
- [x] Make current archive footer status height <= 56px in expanded mode and icon + health dot in collapsed mode.
- [x] Implement global search behavior: 1 character filters current page; Esc clears search; Enter focuses the first result when a result exists; search count updates.
- [x] Add shared toast, drawer, and confirm dialog primitives using Astryx templates/components and StyleX tokens.
- [x] Verification:

```bash
pnpm exec astryx build "desktop app shell side nav global search status footer"
pnpm exec biome check packages/ui-shared/src/components packages/ui-shared/src/hooks
pnpm --dir packages/ui-shared type-check
```

Expected: Browser shows stable shell, true route switching, search count/clear behavior, and no layout overflow at 1280px and 390px widths.

## Task 5: 首页 Dashboard

**Purpose:** Replace the simple overview placeholder with the design-reference dashboard and PRD home states.

**Files:**

- Replace: `packages/ui-shared/src/components/wearchive-shell/OverviewPanel.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/home/HomePage.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/home/HomeStatusSummary.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/home/AccountConsole.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/home/DataKpiGrid.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/home/RecentTaskList.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/home/IssueList.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/home/styles.ts`

- [x] Implement the three home states: normal, needs attention, first use.
- [x] Match design reference sections: summary hero, account console, KPI strip, recent tasks, issue reminders, quick actions.
- [x] Use cards only for dashboard widgets; use list rows for recent tasks and issues.
- [x] Add KPI click handlers that switch to the target view with filter intent.
- [x] Add loading skeleton/shimmer or stable Astryx loading state.
- [x] Add account detail drawer and current archive detail drawer.
- [x] Verification:

```bash
pnpm exec astryx build "analytics dashboard account console KPI recent tasks"
pnpm --dir packages/ui-shared type-check
pnpm --dir packages/fnos-native build:ui
```

Expected: First viewport resembles the design reference dashboard and all main actions have visible state changes.

## Task 6: 聊天记录 Viewer

**Purpose:** Deliver the core product value: browse, search, select, inspect, and hand off conversations for export.

**Files:**

- Create: `packages/ui-shared/src/components/wearchive-pages/records/RecordsPage.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/records/ConversationList.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/records/ConversationFilters.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/records/MessageStream.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/records/MessageBubble.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/records/ConversationDetailPanel.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/records/BatchActionBar.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/records/messageRenderers.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/records/styles.ts`
- Modify: `packages/ui-shared/src/hooks/useApi.ts`

- [x] Implement desktop frame `320px | 1fr | 290px`, matching the design reference.
- [x] Collapse to two panes below 1080px and one pane below 860px.
- [x] Use `List`/row patterns for conversations; do not card-wrap each conversation.
- [x] Render message types: text, image, video placeholder, voice placeholder, file, link, mini program, transfer/red packet placeholder, system, contact card, group notice, merged, unknown.
- [x] Add page-local filters: type, backup status, attachment status, favorites.
- [x] Add global/page search highlighting in conversation rows and message text.
- [x] Add batch selection with selected count, export, re-backup, tag, cancel.
- [x] Implement "导出此会话" handoff to 导入导出 with selected conversations and export mode.
- [x] Verification:

```bash
pnpm exec astryx template ListMessageList --skeleton
pnpm exec astryx build "chat viewer message list detail panel"
pnpm --dir packages/ui-shared type-check
```

Expected: Selecting conversations changes the message stream and detail panel; search filters real rows; empty search state has a clear next action.

Task notes:

- Astryx discovery: `ListMessageList` recommends `Avatar`, `Badge`, `List`; `astryx build "chat viewer message list detail panel"` recommends `detail-page`, `ChatLayout`, and `ChatMessageList` patterns.
- Browser QA: 1143px desktop renders the design-reference three-pane viewer; 900px renders list + message two-pane with detail hidden; 390px renders a single-column stack with message below list and no horizontal overflow.
- Regression fixed: page-local search now synchronizes the active conversation with the controller, so message and detail data refresh when the first filtered row changes.

## Task 7: 备份任务 Page And Task Runtime States

**Purpose:** Make long-running work visible and controllable instead of toast-only.

**Files:**

- Create: `packages/ui-shared/src/components/wearchive-pages/tasks/TasksPage.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/tasks/TaskSummary.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/tasks/TaskBoard.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/tasks/TaskRow.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/tasks/TaskDetailDrawer.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/tasks/TaskLogList.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/tasks/styles.ts`
- Modify: `packages/core/src/services/TaskScheduler.ts`
- Modify: `packages/core/src/repositories/taskRepository.ts`

- [x] Map every PRD task status to user-facing copy and valid actions.
- [x] Implement pause/resume/cancel/retry with immediate UI state changes.
- [x] Add cancel confirmation dialog with the exact PRD risk wording.
- [x] Add detail drawer with progress, processed messages, attachments, path, speed, remaining time, warning/error counts, and logs.
- [x] Add log filters: all/info/warn/error, copy error, export log.
- [x] Add empty state "当前没有任务" with action "立即备份".
- [x] Verification:

```bash
pnpm exec astryx build "task board progress logs drawer"
pnpm --dir packages/core type-check
pnpm --dir packages/ui-shared type-check
```

Expected: A created task can move through waiting, scanning/backing-up, paused, resumed, cancelled, failed, retried, and completed UI states without losing page state.

Notes:

- Astryx discovery already run: `pnpm exec astryx build "task board progress logs drawer"`, `pnpm exec astryx template dashboard --skeleton`, `pnpm exec astryx docs layout`.
- Verified `packages/core` task repository state transitions with `pnpm --dir packages/core test src/repositories/repositories.integration.test.ts`.
- Verified shared task UI with `pnpm --dir packages/ui-shared test src/components/wearchive-pages/tasks/tasksModel.test.ts src/components/wearchive-pages/tasks/TasksPage.test.tsx` and `pnpm --dir packages/ui-shared type-check`.
- Verified cross-target compatibility with `pnpm --dir packages/core type-check && pnpm --dir packages/core build`, `pnpm --dir packages/fnos-native type-check && pnpm --dir packages/fnos-native build:ui`, `pnpm --dir packages/desktop type-check`, and `git diff --check`.
- Browser QA on `http://localhost:5174/app/wearchive/`: fnOS page fills the viewport, "备份任务" renders the summary and queue without horizontal overflow, and the Astryx Text route-switch crash is fixed via the recorded pnpm patch.

## Task 8: 导入导出 Workbench

**Purpose:** Implement the strongest PRD interaction surface and MVP import/export path.

**Files:**

- Create: `packages/ui-shared/src/components/wearchive-pages/transfer/TransferPage.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/transfer/TransferModeSwitch.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/transfer/TransferStepper.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/transfer/ImportWorkbench.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/transfer/ExportWorkbench.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/transfer/PreviewRiskPanel.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/transfer/TransferTaskQueue.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/transfer/transferState.ts`
- Create: `packages/ui-shared/src/components/wearchive-pages/transfer/styles.ts`
- Create: `packages/core/src/exporters/htmlArchiveExporter.ts`
- Create: `packages/core/src/exporters/csvArchiveExporter.ts`
- Create: `packages/core/src/exporters/jsonArchiveExporter.ts`
- Modify: `packages/core/src/archive/normalizedArchiveImporter.ts`

- [x] Implement import mode steps: choose source, choose file/directory, check file, confirm save strategy, run import.
- [x] Implement import demo path from PRD section 26.1 with pause/resume/check warning/detail/report states.
- [x] Use the normalized fixture importer for MVP "本地备份文件" so import creates real archive rows.
- [x] Implement export mode steps: choose range, choose format, content settings, save location, run export.
- [x] Implement export demo path from PRD section 26.2 with conversation search/multi-select, HTML format, desensitization preview, password validation, path check, queue task, pause/resume, report.
- [x] Generate MVP export artifacts for HTML, CSV, and JSON into a selected or mocked writable folder.
- [x] Keep import and export drafts separate when switching modes.
- [x] Keep bottom queue visible whenever tasks exist.
- [x] Verification:

```bash
pnpm exec astryx build "import export workbench stepper task queue risk preview"
pnpm --dir packages/core type-check
pnpm --dir packages/ui-shared type-check
pnpm --dir packages/fnos-native build:ui
```

Expected: Importing the fixture makes chat data visible in 聊天记录; exporting selected conversations produces a report/result state and a task history entry.

Notes:

- Astryx discovery: `pnpm exec astryx build "import export workbench stepper task queue risk preview"`, `pnpm exec astryx template dashboard --skeleton`, `pnpm exec astryx template documentation-design --skeleton`, `pnpm exec astryx docs layout`.
- Core execution: `executeFixtureImport()` calls the normalized fixture importer; `executeExport()` writes HTML, CSV, and JSON artifacts through `packages/core/src/exporters`.
- Shared UI: transfer page covers import/export draft persistence, PRD import path, export multi-select, masking preview, encrypted export password validation, save-path check, local/external queue rendering, and result/report actions.
- Routing follow-up from implementation review: desktop was already route-driven; fnOS is now route-driven with TanStack Router under `/app/wearchive`, and both hosts reuse shared `getWeArchiveViewFromPathname()` / `getWeArchivePathFromView()` mapping.
- Verified: `pnpm --dir packages/core test src/repositories/repositories.integration.test.ts`, `pnpm --dir packages/core type-check && pnpm --dir packages/core build`, `pnpm --dir packages/ui-shared test src/components/wearchive-pages/transfer/TransferPage.test.tsx`, `pnpm --dir packages/ui-shared test src/components/wearchive-shell/routes.test.ts`, `pnpm --dir packages/ui-shared type-check`, `pnpm --dir packages/fnos-native type-check`, `pnpm --dir packages/fnos-native build:ui`, `pnpm --dir packages/desktop type-check`.
- Dev-server route probe: `curl -I http://localhost:5175/app/wearchive/`, `/app/wearchive/import-export`, and `/app/wearchive/backup-tasks` all returned `200 OK`.

## Task 9: 设置 And 恢复管理 MVP

**Purpose:** Cover remaining primary navigation and the high-risk restore surface safely.

**Files:**

- Create: `packages/ui-shared/src/components/wearchive-pages/settings/SettingsPage.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/settings/SettingSection.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/settings/PathSettingRow.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/settings/SecuritySettings.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/settings/styles.ts`
- Create: `packages/ui-shared/src/components/wearchive-pages/restore/RestorePage.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/restore/RestorePointList.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/restore/RestoreStrategyPanel.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/restore/RestoreImpactPreview.tsx`
- Create: `packages/ui-shared/src/components/wearchive-pages/restore/styles.ts`
- Modify: `packages/core/src/repositories/settingsRepository.ts`
- Modify: `packages/core/src/repositories/restoreRepository.ts`

- [x] Implement searchable settings sections: backup, storage, export defaults, security, notifications, performance, advanced.
- [x] Implement switch save feedback with optimistic update, success toast, failure rollback.
- [x] Implement backup/export path checks through platform file APIs.
- [x] Implement password strength UI for local encryption and export encryption defaults without enabling full encryption-at-rest in MVP.
- [x] Implement restore point list and restore point check result.
- [x] Implement restore strategy selection with risk text and confirmation checkbox for overwrite strategies.
- [x] Keep destructive restore execution disabled with explicit reason: "MVP 仅支持检查和预览恢复影响，覆盖当前数据将在恢复执行版本开放。"
- [x] Verification:

```bash
pnpm exec astryx template settings-sidebar --skeleton
pnpm exec astryx build "settings searchable switches restore points risk preview"
pnpm --dir packages/core type-check
pnpm --dir packages/ui-shared type-check
```

Expected: Settings search filters real rows; restore navigation is real; high-risk restore actions are visible but blocked with a clear reason.

Notes:

- Astryx discovery: `pnpm exec astryx template settings-sidebar --skeleton`, `pnpm exec astryx build "settings searchable switches restore points risk preview"`.
- Core restore points: normalized fixture import now creates an available restore point for the imported archive; `listRestorePoints()` and `checkRestorePoint()` are covered by repository integration tests.
- Shared settings UI: searchable sections cover backup, storage, export defaults, security, notifications, performance, and advanced; switch writes are optimistic with rollback text; backup/export paths call the platform file API through the adapter; password strength is preview-only.
- Shared restore UI: restore points, check result, strategy selection, overwrite confirmation, risk preview, disabled reason, and blocked execution are rendered by shared components.
- Verified: `pnpm --dir packages/core test src/repositories/repositories.integration.test.ts src/exporters/exporters.test.ts`, `pnpm --dir packages/core type-check && pnpm --dir packages/core build`, `pnpm --dir packages/ui-shared test src/components/wearchive-shell/routes.test.ts src/components/wearchive-pages/transfer/TransferPage.test.tsx src/components/wearchive-pages/settings/SettingsPage.test.tsx src/components/wearchive-pages/restore/RestorePage.test.tsx`, `pnpm --dir packages/ui-shared type-check`, `pnpm --dir packages/fnos-native type-check`, `pnpm --dir packages/fnos-native build:ui`, `pnpm --dir packages/desktop type-check`.

## Task 10: Platform Integration And Removal Of Parallel UI

**Purpose:** Make desktop and fnOS consume the same MVP app rather than parallel pages.

**Files:**

- Modify: `packages/desktop/src/renderer/src/shared/components/AppShell.tsx`
- Modify: `packages/desktop/src/renderer/src/routeTree.ts`
- Modify: `packages/desktop/src/renderer/src/modules/*/*.tsx`
- Modify: `packages/fnos-native/frontend/src/App.tsx`
- Modify: `packages/fnos-native/backend/routes.ts`
- Modify: `packages/desktop/src/main/ipc/*`
- Modify: `packages/desktop/src/preload/*`

- [x] Keep route modules as adapters that render or select the shared page surface.
- [x] Add the restore route and nav mapping.
- [x] Ensure desktop "立即备份" creates a task and navigates to tasks, not only route-switches.
- [x] Ensure fnOS "立即备份" calls the HTTP task creation route and refreshes shared state.
- [x] Remove unused duplicate UI and duplicate type files after replacement.
- [x] Verification:

```bash
pnpm exec biome check packages/ui-shared/src packages/core/src packages/desktop/src packages/fnos-native
pnpm --dir packages/core type-check
pnpm --dir packages/ui-shared type-check
pnpm --dir packages/desktop type-check
pnpm --dir packages/fnos-native type-check
```

Expected: Desktop and fnOS render the same shared pages with only platform transport differences.

Notes:

- Desktop and fnOS now use TanStack Router root layouts with `Outlet`, and route modules render shared `WeArchiveRoutePage` instances instead of empty placeholder components.
- Shared `WeArchiveShell` provides page context to route children, so desktop/fnOS keep only platform transport and runtime behavior.
- `tasks.start(taskId)` was added across core repositories, shared adapter contract, desktop IPC/preload, fnOS HTTP routes, and platform adapters. Browser QA confirmed `提前开始 -> 暂停 -> 继续 -> 取消` works on real fnOS dev data.
- Verified: `pnpm exec biome check`, `pnpm --dir packages/core test`, `pnpm --dir packages/ui-shared test`, `pnpm --dir packages/core type-check`, `pnpm --dir packages/ui-shared type-check`, `pnpm --dir packages/desktop type-check`, `pnpm --dir packages/fnos-native type-check`, `pnpm --filter @we-archive/core build`, `pnpm --dir packages/fnos-native build:ui`, `pnpm --dir packages/desktop exec electron-vite build`, `git diff --check`.

## Task 11: Visual QA And MVP Acceptance

**Purpose:** Prove the implemented MVP matches the PRD, design reference, and technical guardrails.

**Files:**

- Modify: `DESIGN.md` if new UI tokens or interaction rules are added.
- Create: `docs/product/wearchive-mvp-acceptance.md`
- No screenshots or temporary reports should be committed unless explicitly requested.

- [x] Run source checks:

```bash
pnpm exec biome check
pnpm --dir packages/core type-check
pnpm --dir packages/ui-shared type-check
pnpm --dir packages/desktop type-check
pnpm --dir packages/fnos-native type-check
pnpm --dir packages/fnos-native build:ui
pnpm --dir packages/desktop exec electron-vite build
git diff --check
```

- [ ] Browser QA `http://localhost:5174/app/wearchive/` at desktop viewport:
  - first viewport fills the screen
  - top nav and side nav match design reference structure
  - all primary nav pages switch real content
  - global search filters current page and shows count/empty state
  - import demo path reaches completed import state
  - export demo path reaches completed export state
  - task pause/resume/cancel/retry states work
  - drawers and dialogs close with Esc and do not reset page state
  - console has no relevant warnings/errors

- [x] Browser QA at 390px width:
  - no horizontal overflow
  - chat viewer collapses panes
  - import/export workbench stacks sections
  - buttons and labels remain readable

- [x] Write `docs/product/wearchive-mvp-acceptance.md` with the actual checked evidence and any intentionally deferred non-MVP items.

Notes:

- Acceptance evidence is recorded in `docs/product/wearchive-mvp-acceptance.md`.
- Browser QA covered desktop routes, selected nav sync, viewport fill, global search count/focus, no console warnings/errors, narrow 390px layout, and task start/pause/resume/cancel.
- Browser QA now also covers the import demo path, export demo path, task detail drawer Esc close, and cancel confirmation Esc close.
- Remaining browser QA risk: direct failed-task retry still needs a stable failed-task seed in the running page. The retry behavior is covered by automated UI and core tests.

## Implementation Order

1. Task 1 and Task 2: core contracts and repositories.
2. Task 3: unified adapters.
3. Task 4: frame/search/feedback primitives.
4. Task 5 and Task 6: home and chat viewer.
5. Task 7 and Task 8: task runtime and import/export workbench.
6. Task 9: settings and restore management MVP.
7. Task 10 and Task 11: platform cleanup and acceptance.

Recommended commit boundaries:

- `feat(core): add archive v0 contracts`
- `feat(core): add archive repositories`
- `feat(app): unify desktop and fnos adapters`
- `feat(ui): complete shared shell interactions`
- `feat(ui): add home dashboard`
- `feat(ui): add chat records viewer`
- `feat(ui): add task management`
- `feat(ui): add import export workbench`
- `feat(ui): add settings and restore management`
- `test: document mvp acceptance`

## Self-Review

- PRD coverage: global shell, search, home, chat records, task management, import, export, settings, restore navigation, feedback states, keyboard/responsive/a11y requirements are mapped to tasks.
- Technical coverage: `packages/core`, `packages/ui-shared`, `packages/desktop`, and `packages/fnos-native` boundaries are explicit; shared dependencies remain in catalogs.
- Design coverage: the plan keeps `docs/design/desktop-wechat-backup-rich-content-prd2.html` and `DESIGN.md` as visual sources and requires browser QA.
- Scope control: destructive restore, real WeChat acquisition, full encryption-at-rest, AI, cloud sync, and release packaging are excluded from MVP with explicit reasons.
- Placeholder scan: no task relies on unspecified future work; each task has concrete file paths and verification commands.
