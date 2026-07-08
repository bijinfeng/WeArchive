# 品牌图标：系统图标生成 + AppIcon 组件 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从 `app-icon.svg` 生成跨平台系统图标（.icns/.ico/.png）并封装为 React 组件供 desktop 渲染进程使用。

**Architecture:** 两条独立产出线——（1）构建时：脚本读 SVG → sharp 栅格化 → 生成 3 个系统图标到 desktop/build/；（2）运行时：手工内联 SVG 为 React 组件 → tsdown 打包 → desktop import。

**Tech Stack:** sharp 0.35.3, png-to-ico 3.0.2, @fiahfy/icns-convert 0.0.12, tsdown 0.22.3, vitest, @testing-library/react

## Global Constraints

- Node 包使用 `"type": "module"`，文件扩展名 `.ts`/`.tsx`，import 语句无 `.js` 后缀（bundler moduleResolution）。
- brand 包的 tsconfig extends `@we-archive/tsconfig/base.json`（已配 `"jsx": "react-jsx"` 通过继承链）。
- tsdown 打包输出 ESM/CJS dual format，exports 字段指向 dist/。
- 测试用 vitest + @testing-library/react（catalog: test），运行命令 `pnpm --filter @we-archive/brand test`。
- Git commit 遵循 conventional commits（feat/test/chore），中文或英文描述皆可。
- 生成的图标产物（icon.icns/ico/png）提交进 git。

---

## 文件结构映射

```
packages/brand/
├── src/
│   ├── index.ts              # 新建：包入口，导出 AppIcon + AppIconProps
│   ├── app-icon.tsx          # 新建：AppIcon 组件（手工内联 SVG）
│   └── app-icon.test.tsx     # 新建：组件单测
├── scripts/
│   └── generate-icons.ts     # 新建：图标生成脚本
├── tsdown.config.ts          # 新建：tsdown 打包配置
├── vitest.config.ts          # 新建：vitest 配置
├── package.json              # 修改：新增依赖、脚本、exports
└── tsconfig.json             # 修改：include 加 scripts

packages/desktop/
├── build/
│   ├── icon.icns             # 新建：macOS 图标（生成产物）
│   ├── icon.ico              # 新建：Windows 图标（生成产物）
│   └── icon.png              # 新建：Linux 图标（生成产物）
├── src/main/index.ts         # 修改：解开图标注释、路径改为 build/icon.png
└── package.json              # 修改：新增 @we-archive/brand 依赖
```

**分解原则：** 
- Task 1（组件）与 Task 2（脚本）无依赖，可并行。
- Task 3（desktop 集成）依赖前两个任务产出（组件已打包 + 图标已生成）。
- 每个任务独立可测、可提交。

---

### Task 1: AppIcon React 组件

**Files:**
- Create: `packages/brand/src/app-icon.tsx`
- Create: `packages/brand/src/app-icon.test.tsx`
- Create: `packages/brand/src/index.ts`
- Create: `packages/brand/vitest.config.ts`
- Create: `packages/brand/tsdown.config.ts`
- Modify: `packages/brand/package.json`
- Modify: `packages/brand/tsconfig.json`

**Interfaces:**
- Consumes: `packages/brand/assets/app-icon.svg`（读取其 SVG 路径手工复制）
- Produces: 
  ```ts
  export interface AppIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
  }
  export function AppIcon(props: AppIconProps): React.JSX.Element;
  ```

- [ ] **Step 1.1: 配置 package.json 依赖和脚本**

修改 `packages/brand/package.json`：

```json
{
  "name": "@we-archive/brand",
  "version": "0.0.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "scripts": {
    "build": "tsdown",
    "test": "vitest run",
    "gen:icons": "tsx scripts/generate-icons.ts"
  },
  "dependencies": {
    "react": "catalog:react"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "catalog:test",
    "@testing-library/react": "catalog:test",
    "@we-archive/tsconfig": "workspace:*",
    "@types/react": "catalog:types",
    "sharp": "^0.35.3",
    "png-to-ico": "^3.0.2",
    "@fiahfy/icns-convert": "^0.0.12",
    "tsx": "^4.23.0",
    "tsdown": "catalog:build",
    "vitest": "catalog:test",
    "jsdom": "catalog:test"
  },
  "peerDependencies": {
    "react": "^19.0.0"
  }
}
```

- [ ] **Step 1.2: 配置 tsconfig 包含 scripts**

修改 `packages/brand/tsconfig.json`：

```json
{
  "extends": "@we-archive/tsconfig/base.json",
  "compilerOptions": {
    "types": ["node"],
    "jsx": "react-jsx"
  },
  "include": ["src", "scripts"]
}
```

- [ ] **Step 1.3: 创建 tsdown 配置**

创建 `packages/brand/tsdown.config.ts`：

```ts
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
});
```

- [ ] **Step 1.4: 创建 vitest 配置**

创建 `packages/brand/vitest.config.ts`：

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: [],
  },
});
```

- [ ] **Step 1.5: 安装依赖**

```bash
cd /Users/admin/Desktop/WeArchive
pnpm install
```

Expected: 依赖安装成功，brand 包的 node_modules 包含 react/vitest/tsdown/sharp/tsx 等。

- [ ] **Step 1.6: 写组件的失败测试**

创建 `packages/brand/src/app-icon.test.tsx`：

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppIcon } from "./app-icon";

describe("AppIcon", () => {
  it("renders with default size 32", () => {
    render(<AppIcon data-testid="app-icon" />);
    const svg = screen.getByTestId("app-icon");
    expect(svg.tagName).toBe("svg");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });

  it("renders with custom size", () => {
    render(<AppIcon size={64} data-testid="app-icon" />);
    const svg = screen.getByTestId("app-icon");
    expect(svg).toHaveAttribute("width", "64");
    expect(svg).toHaveAttribute("height", "64");
  });

  it("has accessibility attributes", () => {
    render(<AppIcon data-testid="app-icon" />);
    const svg = screen.getByTestId("app-icon");
    expect(svg).toHaveAttribute("role", "img");
    expect(svg).toHaveAttribute("aria-label", "WeArchive");
    
    const title = svg.querySelector("title");
    expect(title).toBeInTheDocument();
    expect(title?.textContent).toBe("WeArchive");
  });

  it("forwards className prop", () => {
    render(<AppIcon className="custom-class" data-testid="app-icon" />);
    const svg = screen.getByTestId("app-icon");
    expect(svg).toHaveClass("custom-class");
  });

  it("forwards style prop", () => {
    render(<AppIcon style={{ opacity: 0.5 }} data-testid="app-icon" />);
    const svg = screen.getByTestId("app-icon");
    expect(svg).toHaveStyle({ opacity: "0.5" });
  });
});
```

- [ ] **Step 1.7: 运行测试确认失败**

```bash
pnpm --filter @we-archive/brand test
```

Expected: FAIL，`Cannot find module './app-icon'`

- [ ] **Step 1.8: 实现 AppIcon 组件**

创建 `packages/brand/src/app-icon.tsx`（从 `packages/brand/assets/app-icon.svg` 手工复制 SVG 内容）：

```tsx
import type React from "react";

export interface AppIconProps extends React.SVGProps<SVGSVGElement> {
  /** 图标尺寸（宽高相同），默认 32 */
  size?: number | string;
}

export function AppIcon({ size = 32, ...props }: AppIconProps): React.JSX.Element {
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
      <rect width="1024" height="1024" rx="228" fill="#F3F7F4" />
      <path
        d="M512 248C362.3 248 248 352.7 248 488.4C248 568.6 288.5 638.6 351.2 682.5L330.4 779.5C327.4 793.7 342.9 804.5 354.8 796.1L450.3 728.6C470.3 732.4 491 734.4 512 734.4C661.7 734.4 776 629.7 776 494C776 352.7 661.7 248 512 248Z"
        fill="#1F8D61"
      />
      <circle cx="420" cy="496" r="32" fill="#F3F7F4" />
      <circle cx="512" cy="496" r="32" fill="#F3F7F4" />
      <circle cx="604" cy="496" r="32" fill="#F3F7F4" />
    </svg>
  );
}
```

- [ ] **Step 1.9: 创建包入口**

创建 `packages/brand/src/index.ts`：

```ts
export { AppIcon, type AppIconProps } from "./app-icon";
```

- [ ] **Step 1.10: 运行测试确认通过**

```bash
pnpm --filter @we-archive/brand test
```

Expected: PASS，5 tests passed

- [ ] **Step 1.11: 运行 tsdown 打包**

```bash
pnpm --filter @we-archive/brand build
```

Expected: 成功生成 `packages/brand/dist/index.js`、`index.cjs`、`index.d.ts`

- [ ] **Step 1.12: 验证打包产物**

```bash
ls -la packages/brand/dist/
cat packages/brand/dist/index.d.ts | head -20
```

Expected: 目录存在 `index.js`、`index.cjs`、`index.d.ts`，类型定义包含 `AppIcon` 和 `AppIconProps` 导出

- [ ] **Step 1.13: 提交**

```bash
git add packages/brand/
git commit -m "feat(brand): add AppIcon component with tests and build config"
```

---

### Task 2: 图标生成脚本

**Files:**
- Create: `packages/brand/scripts/generate-icons.ts`

**Interfaces:**
- Consumes: `packages/brand/assets/app-icon.svg`（文件路径）
- Produces: 三个文件写入指定输出目录（默认 `../desktop/build/`）：
  - `icon.png`（512×512）
  - `icon.ico`（多尺寸）
  - `icon.icns`（多尺寸）

- [ ] **Step 2.1: 写图标生成脚本**

创建 `packages/brand/scripts/generate-icons.ts`：

```ts
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import sharp from "sharp";
import PngToIco from "png-to-ico";
import { buildIcns } from "@fiahfy/icns-convert";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SIZES = [16, 32, 48, 64, 128, 256, 512, 1024];

async function main() {
  // 解析输出目录参数（--out <dir>）
  const args = process.argv.slice(2);
  const outFlagIndex = args.indexOf("--out");
  const defaultOut = resolve(__dirname, "../../desktop/build");
  const outputDir = outFlagIndex !== -1 && args[outFlagIndex + 1]
    ? resolve(process.cwd(), args[outFlagIndex + 1])
    : defaultOut;

  console.log(`[generate-icons] Output directory: ${outputDir}`);

  // 读取 SVG 源文件
  const svgPath = resolve(__dirname, "../assets/app-icon.svg");
  const svgBuffer = await readFile(svgPath);

  console.log("[generate-icons] Rasterizing SVG to PNG buffers...");

  // 1. sharp 栅格化各尺寸 PNG（全内存）
  const pngBuffers = new Map<number, Buffer>();
  for (const size of SIZES) {
    const buf = await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toBuffer();
    pngBuffers.set(size, buf);
  }

  console.log("[generate-icons] Generated PNG buffers for sizes:", SIZES);

  // 确保输出目录存在
  await mkdir(outputDir, { recursive: true });

  // 2. icon.png（512×512，Linux）
  const pngPath = join(outputDir, "icon.png");
  await writeFile(pngPath, pngBuffers.get(512)!);
  console.log(`[generate-icons] Wrote ${pngPath}`);

  // 3. icon.ico（Windows，16/32/48/64/128/256）
  const icoSizes = [16, 32, 48, 64, 128, 256];
  const icoBuffers = icoSizes.map((s) => pngBuffers.get(s)!);
  const icoBuffer = await PngToIco(icoBuffers);
  const icoPath = join(outputDir, "icon.ico");
  await writeFile(icoPath, icoBuffer);
  console.log(`[generate-icons] Wrote ${icoPath}`);

  // 4. icon.icns（macOS，16/32/64/128/256/512/1024）
  const icnsSizes = [16, 32, 64, 128, 256, 512, 1024];
  const icnsImages = icnsSizes.map((size) => ({
    size,
    buffer: pngBuffers.get(size)!,
  }));
  const icnsBuffer = await buildIcns(icnsImages);
  const icnsPath = join(outputDir, "icon.icns");
  await writeFile(icnsPath, Buffer.from(icnsBuffer));
  console.log(`[generate-icons] Wrote ${icnsPath}`);

  console.log("[generate-icons] Done. All icons generated successfully.");
}

main().catch((err) => {
  console.error("[generate-icons] Error:", err);
  process.exit(1);
});
```

- [ ] **Step 2.2: 运行脚本生成图标**

```bash
pnpm --filter @we-archive/brand gen:icons
```

Expected: 输出日志显示 "Output directory: .../packages/desktop/build"、"Wrote .../icon.png"、"Wrote .../icon.ico"、"Wrote .../icon.icns"、"Done"

- [ ] **Step 2.3: 验证生成的图标文件**

```bash
ls -lh packages/desktop/build/icon.*
file packages/desktop/build/icon.png packages/desktop/build/icon.ico packages/desktop/build/icon.icns
```

Expected: 三个文件存在，`file` 命令识别为：
- `icon.png: PNG image data, 512 x 512`
- `icon.ico: MS Windows icon resource`
- `icon.icns: Mac OS X icon`

- [ ] **Step 2.4: 验证 magic bytes**

```bash
xxd -l 4 packages/desktop/build/icon.png | head -1  # 应为 89 50 4e 47
xxd -l 4 packages/desktop/build/icon.ico | head -1  # 应为 00 00 01 00
xxd -l 4 packages/desktop/build/icon.icns | head -1 # 应为 69 63 6e 73 (icns)
```

Expected: 每个文件的前 4 字节符合预期格式

- [ ] **Step 2.5: 提交脚本和生成的图标产物**

```bash
git add packages/brand/scripts/generate-icons.ts
git add packages/desktop/build/icon.png packages/desktop/build/icon.ico packages/desktop/build/icon.icns
git commit -m "feat(brand): add icon generation script and system icons

- scripts/generate-icons.ts 从 app-icon.svg 生成跨平台图标
- 产出 icon.png (Linux)、icon.ico (Windows)、icon.icns (macOS)
- 图标产物提交进 git 供 electron-builder 使用"
```

---

### Task 3: desktop 集成

**Files:**
- Modify: `packages/desktop/package.json`
- Modify: `packages/desktop/src/main/index.ts`

**Interfaces:**
- Consumes: 
  - `@we-archive/brand` 包（Task 1 产出）
  - `packages/desktop/build/icon.png`（Task 2 产出）

- [ ] **Step 3.1: desktop 新增 brand 依赖**

修改 `packages/desktop/package.json`，在 `dependencies` 中新增：

```json
{
  "dependencies": {
    "@we-archive/brand": "workspace:*",
    "@electron-toolkit/preload": "^3.0.2",
    "@electron-toolkit/utils": "^4.0.0",
    "electron-updater": "^6.8.3"
  }
}
```

- [ ] **Step 3.2: 安装依赖**

```bash
cd /Users/admin/Desktop/WeArchive
pnpm install
```

Expected: brand 包链接到 desktop 的 node_modules

- [ ] **Step 3.3: 修改 main/index.ts 窗口图标**

修改 `packages/desktop/src/main/index.ts`，将第 5 行的注释解开并更正路径：

```ts
import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "node:path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../build/icon.png?asset";

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  // ... 后续代码保持不变
```

修改点：
1. 第 2 行 `import { join } from "path"` → `import { join } from "node:path"`
2. 第 4 行解开注释：`import icon from "../../build/icon.png?asset";`
3. 第 13 行解开注释并格式化：`...(process.platform === "linux" ? { icon } : {}),`

- [ ] **Step 3.4: 验证 desktop 冒烟测试**

```bash
pnpm --filter @we-archive/desktop dev
```

Expected: 
1. 窗口成功启动，无报错
2. Linux 环境下窗口标题栏显示应用图标
3. 终端无 `Cannot find module '@we-archive/brand'` 错误

（手动操作：启动后观察窗口，按 Ctrl+C 停止）

- [ ] **Step 3.5: 在渲染进程验证 AppIcon 组件可导入**

临时修改 `packages/desktop/src/renderer/src/App.tsx` 顶部新增导入：

```tsx
import { AppIcon } from "@we-archive/brand";
```

在组件内添加临时测试代码（在 VStack 内）：

```tsx
<AppIcon size={64} />
```

- [ ] **Step 3.6: 再次运行 dev 验证组件渲染**

```bash
pnpm --filter @we-archive/desktop dev
```

Expected: 窗口内渲染出 WeArchive logo（64px 尺寸），无报错

（验证后恢复 App.tsx 为原样 —— 该步骤仅验证导入可用，不作为最终代码提交）

- [ ] **Step 3.7: 提交 desktop 集成**

```bash
git add packages/desktop/package.json packages/desktop/src/main/index.ts
git commit -m "feat(desktop): integrate brand package and app icons

- 新增 @we-archive/brand 依赖供渲染进程使用
- main 进程引用 build/icon.png 作为 Linux 窗口图标
- macOS/Windows 图标由 electron-builder 自动从 build/ 读取"
```

---

### Task 4: 最终验证与文档

**Files:**
- Verify: 所有交付物

**Interfaces:**
- Consumes: 前三个任务的全部产出

- [ ] **Step 4.1: 运行完整测试套件**

```bash
pnpm --filter @we-archive/brand test
```

Expected: All tests pass (5 tests)

- [ ] **Step 4.2: 验证 tsdown 打包产物**

```bash
pnpm --filter @we-archive/brand build
ls -lh packages/brand/dist/
```

Expected: `dist/index.js`、`index.cjs`、`index.d.ts` 存在且非空

- [ ] **Step 4.3: 验证图标生成幂等性**

```bash
pnpm --filter @we-archive/brand gen:icons
git status packages/desktop/build/
```

Expected: `git status` 显示 `nothing to commit, working tree clean`（图标未变化，幂等）

- [ ] **Step 4.4: 验证 desktop 完整启动**

```bash
pnpm --filter @we-archive/desktop dev
```

Expected: 
1. 窗口启动成功
2. 渲染进程可以 `import { AppIcon } from "@we-archive/brand"` 且无运行时错误
3. 终端无任何 module resolution 错误

（手动观察后按 Ctrl+C 停止）

- [ ] **Step 4.5: 检查 git 状态与提交历史**

```bash
git log --oneline -5
git status
```

Expected: 
- 最近 3 条 commit 分别为 Task 3/2/1 的提交
- 工作区干净（`nothing to commit`）

- [ ] **Step 4.6: 更新 AGENTS.md 或项目文档（可选）**

如果项目根目录有 README 或开发文档需要记录这个新能力，添加一段：

```markdown
## 品牌图标

- **React 组件**: `import { AppIcon } from "@we-archive/brand"`，支持 `size` prop 和所有 SVG 属性透传。
- **系统图标生成**: `pnpm --filter @we-archive/brand gen:icons` 从 `assets/app-icon.svg` 生成跨平台图标。
- **构建集成**: electron-builder 自动从 `packages/desktop/build/` 读取 icon.icns/ico/png 打包安装程序。
```

（如果无文档需更新则跳过此步）

- [ ] **Step 4.7: 最终提交（如有文档更新）**

```bash
git add README.md  # 或相应文档文件
git commit -m "docs: add brand icon usage to project docs"
```

---

## 实现完成检查清单

完成所有任务后，验证以下交付物：

**新增文件：**
- [ ] `packages/brand/src/index.ts`
- [ ] `packages/brand/src/app-icon.tsx`
- [ ] `packages/brand/src/app-icon.test.tsx`
- [ ] `packages/brand/scripts/generate-icons.ts`
- [ ] `packages/brand/tsdown.config.ts`
- [ ] `packages/brand/vitest.config.ts`
- [ ] `packages/desktop/build/icon.icns`
- [ ] `packages/desktop/build/icon.ico`
- [ ] `packages/desktop/build/icon.png`

**修改文件：**
- [ ] `packages/brand/package.json`（依赖、脚本、exports）
- [ ] `packages/brand/tsconfig.json`（include scripts）
- [ ] `packages/desktop/package.json`（brand 依赖）
- [ ] `packages/desktop/src/main/index.ts`（图标引用）

**验证通过：**
- [ ] `pnpm --filter @we-archive/brand test` 全部通过
- [ ] `pnpm --filter @we-archive/brand build` 成功生成 dist/
- [ ] `pnpm --filter @we-archive/brand gen:icons` 生成三个图标且 magic bytes 正确
- [ ] `pnpm --filter @we-archive/desktop dev` 窗口正常启动，无报错
- [ ] 渲染进程可成功 `import { AppIcon } from "@we-archive/brand"`
- [ ] Git 历史包含 3-4 个功能提交，产物已提交
