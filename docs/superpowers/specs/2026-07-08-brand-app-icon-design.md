# 品牌图标：系统图标生成 + AppIcon 组件 设计文档

日期：2026-07-08
状态：已批准，待实现

## 背景与目标

`packages/brand/assets/app-icon.svg` 是 WeArchive 的品牌 logo 源文件（1024×1024，深绿 `#1F8D61` + 浅底 `#F3F7F4`）。目前 brand 包只有这一个源文件，但已配置 `tsdown`（打包）与 `react` 依赖，设计上要产出可导入的组件。

本任务从这个唯一源文件产出两条独立产物线：

1. **系统图标** — 供 electron-builder 打包客户端安装包（macOS `.icns` / Windows `.ico` / Linux `.png`）。
2. **前端 Logo 组件** — 供 desktop 渲染进程在页面中展示品牌 logo。

## 范围

- 仅品牌 Logo 组件（不建通用图标体系；astryx 已自带 `@astryxdesign/core/Icon`）。
- 图标生成走本地脚本（纯 JS，跨平台，不依赖 macOS `iconutil`）。
- 生成的系统图标产物提交进 git。

不在范围：修复预存的 `@types/node@26` typecheck 冲突（与本任务无关）。

## 整体架构

```
packages/brand/
├── assets/
│   └── app-icon.svg              # 唯一品牌源文件（已存在，唯一真相）
├── src/
│   ├── index.ts                  # 包入口，导出 AppIcon
│   └── app-icon.tsx              # 内联 SVG 的 React 组件
├── scripts/
│   └── generate-icons.ts         # SVG → 系统图标生成脚本
├── package.json                  # 新增 build + gen:icons 脚本、生成依赖、exports
└── tsconfig.json

packages/desktop/
├── build/
│   ├── icon.icns                 # ← 生成产物（macOS），提交进 git
│   ├── icon.ico                  # ← 生成产物（Windows），提交进 git
│   └── icon.png                  # ← 生成产物（Linux 512×512），提交进 git
└── src/main/index.ts             # 窗口图标引用（解开现有注释）
```

**两条独立产出线，同一个源：**

1. **运行时线**：`app-icon.svg` → `AppIcon` 组件（`app-icon.tsx` 手工内联 SVG）→ tsdown 打包 → desktop 渲染进程 `import { AppIcon } from "@we-archive/brand"`。
2. **构建时线**：`app-icon.svg` → `generate-icons.ts` → 三个系统图标文件写入 `desktop/build/` → electron-builder 打包时读取。

两条线互不依赖：组件是 TS 源码打包，图标是二进制资产生成。

**图标生成脚本归属（方案 A）**：脚本放在 brand 包，输出目录参数化（`--out`，默认 `../desktop/build`）。品牌资产能力集中在 brand，desktop 只消费。

## AppIcon 组件接口

文件：`packages/brand/src/app-icon.tsx`

```tsx
export interface AppIconProps extends React.SVGProps<SVGSVGElement> {
  /** 图标尺寸（宽高相同），默认 32 */
  size?: number | string;
}

export function AppIcon({ size = 32, ...props }: AppIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="WeArchive"
      {...props}
    >
      <title>WeArchive</title>
      {/* rect / path / circles 从 app-icon.svg 原样手工内联 */}
    </svg>
  );
}
```

设计要点：

- **单一 `size` prop**：logo 为正方形，一个 `size` 同时控制宽高。
- **继承 `React.SVGProps`**：`className`/`style`/`onClick`/`aria-*` 全部透传；`{...props}` 置于内置属性之后，允许消费方覆盖 `aria-label` 等。
- **不加 `color` prop**（YAGNI）：品牌 logo 为固定配色，不应随意改色；特殊需求可通过透传的 `style` 实现。
- **保留 `<title>` 与 `role`/`aria-label`**：满足 biome 无障碍规则（`lint/a11y/noSvgWithoutTitle`）。
- **手写内联 SVG**（非 svgr）：单文件场景零构建依赖，最简单。
- **`app-icon.svg` 保留为源文件**：作为图标生成脚本的输入与唯一真相；`app-icon.tsx` 的 JSX 是它的手工内联副本。

包入口 `src/index.ts`：`export { AppIcon, type AppIconProps } from "./app-icon";`

## 图标生成脚本

文件：`packages/brand/scripts/generate-icons.ts`（纯 Node，跨平台）

```
输入：assets/app-icon.svg
输出目录：默认 ../desktop/build，可通过 CLI 参数 --out <dir> 覆盖

栅格化尺寸：[16, 32, 48, 64, 128, 256, 512, 1024]

流程（全内存管道，不落临时文件）：
1. 读 app-icon.svg 为 buffer
2. sharp(svg).resize(n).png() → 各尺寸 PNG buffer
3. icon.png  ← 512×512 PNG（Linux）
4. icon.ico  ← png-to-ico([16,32,48,64,128,256])
5. icon.icns ← @fiahfy/icns-convert 从 [16,32,64,128,256,512,1024] 组装
最终只写 3 个产物文件
```

产物与库对应：

| 产物 | 平台 | 库链路 | 尺寸 |
|------|------|--------|------|
| `icon.png` | Linux | sharp | 512 |
| `icon.ico` | Windows | sharp → png-to-ico | 16/32/48/64/128/256 |
| `icon.icns` | macOS | sharp → @fiahfy/icns-convert | 16/32/64/128/256/512/1024 |

关键设计：

- **全内存管道**：sharp 生成的 PNG buffer 直接喂给 png-to-ico / icns-convert，跑完只写 3 个最终产物。
- **纯 JS 依赖**：不调用 macOS `iconutil`，Windows/Linux CI 上也能生成 `.icns`。
- **输出目录参数化**：默认 `packages/desktop/build/`，接受 `--out`，路径解耦。
- **幂等**：每次覆盖写，可反复运行。
- **不纳入 postinstall**：手动 / CI 触发。源 SVG 很少变。
- **产物提交进 git**：CI 打包无需安装 sharp（sharp 含原生二进制，CI 安装慢且易失败），克隆即可打包。

依赖版本（devDependencies）：

- `sharp@^0.35.3`
- `png-to-ico@^3.0.2`
- `@fiahfy/icns-convert@^0.0.12`
- `tsx@^4.23.0`（运行 TS 脚本）

`package.json` 脚本变更：

```jsonc
{
  "scripts": {
    "build": "tsdown",
    "gen:icons": "tsx scripts/generate-icons.ts",
    "test": "vitest run --config vitest.config.ts"
  },
  "exports": { ".": { /* tsdown 产出入口 */ } }
}
```

## desktop 集成

**① 窗口图标** — `packages/desktop/src/main/index.ts` 解开现有注释：

```ts
import icon from "../../build/icon.png?asset";
// ...
const mainWindow = new BrowserWindow({
  // ...
  icon,   // Linux 运行时窗口图标需显式设置
});
```

macOS/Windows 的应用图标由 electron-builder 自动从 `build/icon.icns` / `icon.ico` 读取（`electron-builder.yml` 已配 `directories.buildResources: build`），无需改动配置。

**② 依赖接线** — desktop 的 `package.json` 新增：

```jsonc
"dependencies": {
  "@we-archive/brand": "workspace:*"
}
```

渲染进程即可 `import { AppIcon } from "@we-archive/brand"`。

## 测试策略

**组件单测**（brand 包已配 vitest）— `src/app-icon.test.tsx`：

- 渲染 `<AppIcon size={48} />`，断言 `<svg>` 的 width/height=48。
- 断言 `role="img"`、`<title>` 文本为 `WeArchive`。
- 断言 `className` 透传生效。

**生成脚本**不写单测（重逻辑在三方库），改为**产物验证**：运行 `gen:icons` 后断言三个产物存在且 magic bytes 正确：

- `.png` 头：`89 50 4E 47`
- `.ico` 头：`00 00 01 00`
- `.icns` 头：`icns`（`69 63 6E 73`）

## 验证清单（实现后实际执行）

1. `pnpm --filter @we-archive/brand gen:icons` → 确认 3 个文件生成、magic bytes 正确。
2. `pnpm --filter @we-archive/brand build` → tsdown 打包组件成功。
3. `pnpm --filter @we-archive/brand test` → 组件单测通过。
4. `pnpm --filter @we-archive/desktop dev` → 冒烟：窗口启动、渲染进程 import AppIcon 无报错。

验证以 build / test / 冒烟为准，不依赖全量 `tsc`（规避预存的 `@types/node@26` 冲突）。

## 交付物清单

新增：
- `packages/brand/src/index.ts`
- `packages/brand/src/app-icon.tsx`
- `packages/brand/src/app-icon.test.tsx`
- `packages/brand/scripts/generate-icons.ts`
- `packages/desktop/build/icon.icns`（生成产物）
- `packages/desktop/build/icon.ico`（生成产物）
- `packages/desktop/build/icon.png`（生成产物）

修改：
- `packages/brand/package.json`（脚本、依赖、exports）
- `packages/desktop/package.json`（新增 brand 依赖）
- `packages/desktop/src/main/index.ts`（窗口图标）
