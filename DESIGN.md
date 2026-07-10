# WeArchive Design System

Date: 2026-07-10
Status: active baseline
Source: `docs/design/desktop-wechat-backup-rich-content-prd2.html`

## Design Direction

WeArchive 的界面基调是桌面生产力应用，不做营销式大面积装饰。整体应接近设计稿中的 macOS/Windows 客户端工作台：浅冷灰窗口背景、白色内容面、细边框、低对比阴影、微信绿主操作、深蓝灰文字、紧凑但清晰的信息密度。品牌主色固定使用微信绿 `#07C160`，不要回退到设计稿早期的深绿 `#0B7A46`。

fnOS 和 desktop 共用同一套 UI 与主题。平台包只负责运行时能力、路由、API/IPC/HTTP 适配和原生窗口行为；主题、导航、布局、卡片、状态、业务展示组件都放在 `packages/ui-shared`。

## Astryx Theme

主题定义在：

- Source: `packages/ui-shared/src/theme/weArchiveTheme.ts`
- Built theme: `packages/ui-shared/src/theme/wearchive.js`
- Built CSS: `packages/ui-shared/src/theme/wearchive.css`

主题更新后必须重新生成 built 产物：

```bash
pnpm exec astryx theme build packages/ui-shared/src/theme/weArchiveTheme.ts
```

共享 shell 通过 `Theme theme={weArchiveTheme} mode="light"` 应用主题。当前默认固定 light，以匹配已批准设计稿；dark token 已保留，后续如增加主题切换再接入运行时状态。

## Token Mapping

| Design variable | Astryx token | Light | Dark |
| --- | --- | --- | --- |
| WeChat green | `--color-accent`, `--color-success` | `#07C160` | `#39D978` |
| WeChat green muted | `--color-accent-muted`, `--color-success-muted` | `#E6F8EE` | `#0B2F1A` |
| WeChat green border | `--color-border-green` | `#8BE7B5` | `#1F7A45` |
| `--window` | `--color-background-surface` | `#FBFCFD` | `#101821` |
| `--surface` | `--color-background-card` | `#FFFFFF` | `#17212B` |
| `--surface-2` | `--color-background-body` | `#F7F8FA` | `#121922` |
| `--surface-3` | `--color-background-muted` | `#EDF1F4` | `#22303D` |
| `--line` | `--color-border` | `#DDE3E8` | `#2C3946` |
| `--line-2` | `--color-border-emphasized` | `#CBD4DC` | `#415160` |
| `--text` | `--color-text-primary` | `#12191F` | `#E9EFF6` |
| `--muted` | `--color-text-secondary` | `#65717C` | `#9AA8B6` |
| `--subtle` | `--color-text-disabled` | `#8D98A3` | `#738292` |
| `--blue` | `--color-text-blue`, `--color-icon-blue` | `#1D64A7` | `#7CBDFF` |
| `--amber` | `--color-text-orange`, `--color-icon-orange` | `#8A5A13` | `#F1C45C` |
| `--red` | `--color-error`, `--color-text-red` | `#B42318` | `#FF8A7D` |

Radius:

- Controls and nav rows: `--radius-element` = `8px`
- Cards and panels: `--radius-container` = `8px`
- Desktop framed window: `--radius-page` = `18px`
- Pills stay `--radius-full`

Sizing and motion:

- Compact controls use `--size-element-sm` = `28px`
- Default controls use `--size-element-md` = `34px`
- Large controls use `--size-element-lg` = `40px`
- Fast interaction motion uses `--duration-fast` = `140ms`

## Component Rules

- Full app layout must use Astryx `AppShell`, `TopNav`, `SideNav`, `Layout`, and Stack primitives.
- Navigation lives in the shared shell. Do not duplicate top nav or side nav in desktop/fnOS.
- Brand mark and selected side-nav item use the WeChat green accent family: `--color-accent`, `--color-accent-muted`, `--color-text-accent`, and `--color-icon-accent`.
- Primary actions use Astryx `Button variant="primary"` and the theme accent token.
- Search and filters use Astryx inputs and tokens before custom styling.
- Counts use `Badge`; operational state uses `StatusDot` or `Token`.
- Dense lists should be row/list/table surfaces, not card-wrapped repeated items.
- Cards are reserved for dashboard metrics, account panels, settings groups, and modal/floating task surfaces.

## Styling Rules

- Custom component styling must be StyleX.
- Prefer Astryx component props first; use StyleX only for shell-level layout, platform chrome, and product-specific composition.
- StyleX values must use Astryx tokens: `var(--color-*)`, `var(--spacing-*)`, `var(--radius-*)`, `var(--shadow-*)`, `var(--duration-*)`.
- Do not add local CSS modules, Tailwind-style utilities, raw `:root` overrides, or duplicate platform-specific UI styles.
- If a visual value appears in more than one shared component, promote it into the Astryx theme or a shared StyleX style.

## Platform Chrome

- macOS desktop uses native traffic lights; reserve left titlebar space but do not draw custom mac controls.
- Windows desktop uses shared custom window controls wired to Electron IPC.
- fnOS uses the same shared shell without desktop traffic-light or Windows control affordances.
- The app layout must always fill the viewport in desktop and fnOS.

## Verification

After theme or shell changes, run focused checks:

```bash
pnpm exec biome check packages/ui-shared/src packages/desktop/src packages/fnos-native/frontend/src
pnpm --dir packages/ui-shared type-check
pnpm --dir packages/fnos-native type-check
pnpm --dir packages/desktop type-check
pnpm --dir packages/fnos-native build:ui
pnpm --dir packages/desktop exec electron-vite build
```

For visual work, verify the rendered app in the browser against the design reference and check:

- first viewport fills the screen
- top nav, side nav, cards, buttons, and status tokens use the theme colors
- no text overlap or clipping at the current desktop viewport
- console has no relevant warnings or errors
