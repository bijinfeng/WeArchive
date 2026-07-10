# WeArchive MVP Acceptance

Date: 2026-07-10
Status: active acceptance evidence

## Sources

- PRD: `docs/product/wechat-backup-prd.md`
- Technical design: `docs/technical/shared-core-ui-and-fnos-native.md`
- Design reference: `docs/design/desktop-wechat-backup-rich-content-prd2.html`
- Theme/design rules: `DESIGN.md`
- Implementation plan: `docs/superpowers/plans/2026-07-10-wearchive-mvp.md`

## Source Verification

| Check | Result | Notes |
| --- | --- | --- |
| `pnpm exec biome check` | Pass | 209 files checked, no fixes applied. |
| `pnpm --dir packages/core test` | Pass | 3 files, 5 tests. |
| `pnpm --dir packages/ui-shared test` | Pass | 13 files, 36 tests; Vitest reports a close-timeout warning after successful completion. |
| `pnpm --dir packages/core type-check` | Pass | `tsc --noEmit`. |
| `pnpm --dir packages/ui-shared type-check` | Pass | `tsc --noEmit`. |
| `pnpm --dir packages/desktop type-check` | Pass | `tsc --noEmit`. |
| `pnpm --dir packages/fnos-native type-check` | Pass | `tsc --noEmit`. |
| `pnpm --filter @we-archive/core build` | Pass | Rebuilt core package exports used by platform packages. |
| `pnpm --dir packages/fnos-native build:ui` | Pass with warning | Vite built UI; reports a large chunk warning. |
| `pnpm --dir packages/desktop exec electron-vite build` | Pass | Main, preload, and renderer built. |
| `git diff --check` | Pass | No whitespace errors. |

## Browser QA Evidence

Test target: `http://localhost:5175/app/wearchive/`

Desktop viewport `1280x800`:

- Primary routes `/`, `/chat-records`, `/backup-tasks`, `/import-export`, `/restore`, and `/settings` all rendered real page content.
- Each route updated the selected side-nav item.
- `#root` filled the viewport height and the document had no horizontal overflow.
- Global search on `聊天记录` with `项目群` showed matching result count, filtered the page, and Enter focused the first matching conversation row.
- Browser console returned no warnings or errors.
- Import demo path was clicked in browser: source selection, file selection, check, pause, resume, and warning review all reached their expected visible states.
- Export demo path was clicked in browser: selected 3 real fixture conversations, selected HTML, enabled masking preview, checked save path, and started an export task visible in the bottom queue.
- Task detail drawer closed with Esc and kept the page/task state.
- Cancel confirmation dialog closed with Esc after adding shared `ConfirmDialog` Escape handling.

Narrow viewport `390x844`:

- `聊天记录`, `导入导出`, and `设置` rendered without horizontal overflow.
- `#root` filled the viewport height.
- Chat and transfer surfaces stacked into narrow layouts instead of requiring horizontal scroll.

Task interaction browser QA:

- `提前开始` now starts the selected waiting task instead of creating a new task.
- Started task shows `正在查找聊天记录` and exposes `暂停`.
- `暂停` changes the task to `已暂停，已完成部分会保留` and exposes `继续`.
- `继续` changes the task to `正在备份聊天记录` and exposes `暂停`.
- `取消` opens the PRD risk copy: `确定取消这个任务吗？已完成的备份会保留，未完成部分不会继续。`
- Confirming cancel changes the task to `已取消`.
- Failed-task retry is covered by automated UI and core tests; fnOS backend now exposes a dev-only `/api/dev/seed-failed-task` endpoint for direct browser retry QA.

## Automated Interaction Coverage

- Import demo path: `TransferPage.test.tsx` covers source selection, file selection, file check, pause, resume, warning review.
- Export demo path: `TransferPage.test.tsx` covers conversation range selection, HTML format, masking preview, path selection, queue creation, and encrypted password validation.
- Task model: `tasksModel.test.ts` covers PRD status copy and available actions including retry.
- Task UI: `TasksPage.test.tsx` covers pause, cancel confirmation, log drawer actions, and failed task retry back to queue.
- Routes: `routes.test.ts` covers desktop and fnOS base-path route mapping.
- Search targets: `searchTargets.test.ts` covers target marking, Enter focus, no-match behavior, and current-page result counting.

## MVP Coverage

- Shared shell, top nav, side nav, viewport fill, route persistence, and WeChat-green theme are implemented in `packages/ui-shared`.
- Desktop and fnOS consume the shared shell and page surfaces through thin router/API adapters.
- Archive v0 fixture import, repositories, transfer/export, settings, restore points, and task state APIs live in `packages/core`.
- Desktop IPC and fnOS HTTP routes expose the same adapter domains.
- Primary pages exist for 首页, 聊天记录, 备份任务, 导入导出, 恢复管理, and 设置.
- Restore execution remains disabled with explicit MVP reason.

## Deferred Non-MVP Items

- Real WeChat phone-to-desktop acquisition protocol.
- Destructive restore execution.
- Full encryption-at-rest implementation.
- AI retrieval, cloud sync, release packaging, and auto-update.
- Perfect playback for every media type; unsupported media remains readable placeholder content.
- Bundle code splitting for large fnOS/desktop renderer chunks.

## Remaining QA Risk

- Direct browser retry QA still needs one final manual pass in the running page; the dev-only failed-task seed endpoint is now available, and automated UI/core tests cover the behavior.
