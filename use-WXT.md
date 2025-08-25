# 浏览器扩展开发框架-WXT

[WXT](https://github.com/wxt-dev/wxt) 是一个用于开发浏览器扩展的框架，支持 Chrome、Edge、Firefox 和 Safari 浏览器。它简化了扩展的开发过程，提供了统一的 API 和工具，使开发者能够更轻松地创建跨浏览器的扩展。

## WXT 框架特点
WXT 框架提供了以下功能：

### 多平台与多规范支持
- 🌐 兼容所有主流浏览器。
- ✅ 同时支持 MV2 和 MV3 两种扩展规范。

### 高效开发体验
- ⚡ 具备开发模式，支持热重载（HMR）和快速重新加载，加速开发迭代。
- 📂 采用文件式入口点，通过项目文件结构自动生成扩展清单（Manifest），还支持内联配置。
- 🚔 默认集成 TypeScript，提升大型项目的稳定性和可维护性。
- 🦾 提供自动导入功能，减少代码冗余，简化开发流程。

### 扩展功能与工具
- 🤖 支持自动化发布，可实现打包、上传、提交扩展的全流程自动化。
- 🎨 与前端框架无关，能与 Vue、React、Svelte 等配合使用（需对应 Vite 插件）。
- 📦 拥有模块系统，方便在多个扩展间复用代码，模块可在构建过程的不同步骤运行代码以修改构建。
- 🖍️ 能快速搭建新项目，降低初始配置成本。
- 📏 提供捆绑分析功能，帮助优化扩展体积。
- ⬇️ 支持下载并打包远程 URL 导入的资源。

### 其他特性
- 提供详细的文档（[wxt.dev](https://wxt.dev)）、示例及 Discord 社区支持。
- 集成 GitHub Actions 示例，支持自动化版本管理、变更日志生成和发布流程。
- 基于 MIT 许可证开源，由社区维护并接受赞助支持。

## 快速开始
使用 pnpm 快速开始 WXT 项目开发的步骤如下：

### 1. 初始化项目
通过 `pnpm dlx` 直接调用 WXT 的初始化命令，快速创建项目骨架：
```sh
pnpm dlx wxt@latest init
```
执行后会提示选择项目目录、模板（如 Vue、React、Vanilla 等）和包管理器（选择 `pnpm` 即可）。

### 2. 进入项目目录
假设项目目录为 `my-extension`，进入该目录：
```sh
cd my-extension
```

### 3. 安装依赖
如果初始化过程中未自动安装依赖，手动安装：
```sh
pnpm install
```

### 4. 启动开发服务器
运行开发命令，默认会针对 Chrome 浏览器启动热重载开发环境：
```sh
pnpm dev
```
如需开发 Firefox 扩展，可使用：
```sh
pnpm dev:firefox
```

### 5. 项目结构说明
初始化后的核心目录结构如下（重点关注）：
- `entrypoints/`：扩展入口文件（如 background、popup、content-script 等）
- `public/`：静态资源（图标、HTML 等）
- `wxt.config.ts`：WXT 核心配置文件
- `package.json`：项目依赖和脚本配置

### 6. 构建与打包
- 构建生产版本（默认 Chrome）：
  ```sh
  pnpm build
  ```
- 构建 Firefox 版本：
  ```sh
  pnpm build:firefox
  ```
- 打包成扩展 zip（用于发布）：
  ```sh
  pnpm zip          # Chrome 版本
  pnpm zip:firefox  # Firefox 版本
  ```

以上步骤即可完成从项目初始化到开发调试、构建打包的全流程，利用 pnpm 的高效依赖管理特性加速 WXT 扩展开发。

## 目录结构
WXT 框架的项目目录目录结构设计遵循简洁、直观的原则，同时同时支持灵活配置以适配应用户需求。以下是详细的目录结构说明：


### **默认目录结构（基础版）**
未指定 `srcDir` 时，项目根目录直接包含所有源代码和配置文件，结构如下：
```html
📂 {rootDir}/                  # 项目根目录
   📁 .output/                 # 构建产物目录（自动生成）
   📁 .wxt/                    # WXT 生成的临时文件（如 TS 配置，自动生成）
   📁 assets/                  # 静态资源（CSS、图片等，会被 WXT 处理）
   📁 components/              # UI 组件（默认自动导入）
   📁 composables/             # Vue 组合式函数（默认自动导入）
   📁 entrypoints/             # 扩展入口文件（核心目录）
   📁 hooks/                   # React/Solid 钩子函数（默认自动导入）
   📁 modules/                 # 本地 WXT 模块（用于复用代码）
   📁 public/                  # 静态资源（直接复制到输出目录，不经过处理）
   📁 utils/                   # 通用工具函数（默认自动导入）
   📄 .env                     # 环境变量
   📄 .env.publish             # 发布时使用的环境变量
   📄 app.config.ts            # 运行时配置
   📄 package.json             # 项目依赖配置
   📄 tsconfig.json            # TypeScript 配置
   📄 web-ext.config.ts        # 浏览器启动配置（如启动参数）
   📄 wxt.config.ts            # WXT 核心配置文件
```


### **核心目录与文件说明**
1. **`.output/`**  
   构建生成的产物目录，包含针对不同浏览器和 Manifest 版本的扩展文件（如 `chrome-mv3/`、`firefox-mv2/`）。

2. **`entrypoints/`**  
   扩展的入口文件目录，是 WXT 的核心目录，文件/目录名决定入口类型（如 `popup`、`background` 等）。
    - 支持单文件或目录形式（推荐目录形式，方便管理相关文件）：
      ```html
      📂 entrypoints/
         📂 popup/            # 弹窗入口（目录形式）
            📄 index.html     # 入口 HTML
            📄 main.ts        # 逻辑代码
            📄 style.css      # 样式
         📄 background.ts     # 背景脚本（单文件形式）
      ```
    - 入口类型通过文件名/目录名识别（如 `background`、`options`、`content-script` 等）。

3. **`public/`**  
   无需处理的静态资源（如图标、HTML），会被直接复制到构建产物的根目录。
    - 例如：`public/icon.png` 会被复制到 `.output/chrome-mv3/icon.png`。

4. **`modules/`**  
   本地 WXT 模块，用于在多个扩展间复用代码，可通过 `wxt.config.ts` 配置加载。

5. **自动导入目录**  
   以下目录中的内容会被自动导入，无需手动 `import`：
    - `components/`：UI 组件（如 Vue/React 组件）。
    - `composables/`：Vue 组合式函数（仅 Vue 项目）。
    - `hooks/`：React/Solid 钩子函数（仅对应框架项目）。
    - `utils/`：通用工具函数。

6. **配置文件**
    - `wxt.config.ts`：WXT 核心配置（如入口目录、输出目录、浏览器目标等）。
    - `web-ext.config.ts`：配置开发时浏览器启动参数（如自动打开扩展页面）。
    - `app.config.ts`：运行时配置，可在代码中通过 `import { useAppConfig } from 'wxt'` 访问。


### **带 `src/` 目录的结构（推荐）**
若希望将源代码与配置文件分离，可通过 `wxt.config.ts` 配置 `srcDir: 'src'`，结构如下：
```html
📂 {rootDir}/                  # 项目根目录
   📁 .output/                 # 构建产物
   📁 .wxt/                    # 临时文件
   📁 modules/                 # 本地 WXT 模块（相对于根目录）
   📁 public/                  # 静态资源（相对于根目录）
   📂 src/                     # 源代码根目录
      📁 assets/               # 处理过的静态资源
      📁 components/           # UI 组件
      📁 composables/          # Vue 组合式函数
      📁 entrypoints/          # 扩展入口
      📁 hooks/                # React/Solid 钩子
      📁 utils/                # 工具函数
      📄 app.config.ts         # 运行时配置
   📄 .env                     # 环境变量
   📄 package.json             # 依赖配置
   📄 wxt.config.ts            # WXT 配置（需指定 srcDir: 'src'）
```


### **目录自定义配置**
可通过 `wxt.config.ts` 自定义核心目录路径，示例：
```typescript
// wxt.config.ts
export default defineConfig({
  srcDir: "src",             // 源代码根目录（默认：.）
  modulesDir: "wxt-modules", // 本地模块目录（默认：modules）
  outDir: "dist",            // 输出目录（默认：.output）
  publicDir: "static",       // 静态资源目录（默认：public）
  entrypointsDir: "entries", // 入口文件目录（默认：entrypoints，相对于 srcDir）
});
```


### **注意事项**
- `entrypoints/` 目录仅支持**0 或 1 层嵌套**，深层嵌套的文件不会被识别为入口。  
  错误示例：`entrypoints/nested/entry/index.ts`（无法识别）。  
  正确示例：`entrypoints/nested-entry/index.ts`。
- 若修改了目录结构（如启用 `srcDir`），需确保 `public/`、`modules/` 等目录的路径与配置一致，避免资源找不到。

通过以上结构，WXT 实现了源代码与配置的清晰分离，同时利用自动导入和文件式入口简化了扩展开发流程。

## 浏览器扩展开发核心模块
## wxt cli 常用命令
WXT 提供了一系列命令来简化浏览器扩展的开发、构建和发布流程。以下是常用命令及其说明：
1. **`wxt dev`**：启动开发服务器，自动编译和刷新浏览器。
2. **`wxt build`**：构建生产版本的扩展，生成适用于各浏览器的打包文件。
3. **`wxt zip`**：将构建产物打包成 ZIP 文件，方便上传到浏览器扩展商店。
4. **`wxt lint`**：运行代码检查工具，确保代码质量。
5. **`wxt test`**：运行测试用例，确保扩展功能正常。
6. **`wxt publish`**：自动化发布扩展到各大