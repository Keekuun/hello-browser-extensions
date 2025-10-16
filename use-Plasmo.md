# 浏览器扩展开发框架-Plasmo

[Plasmo](https://docs.plasmo.com/) 是一个现代化的浏览器扩展开发平台，专为简化扩展开发流程而设计。它支持所有主流浏览器（Chrome、Firefox、Edge、Safari），并提供了丰富的工具和功能来加速扩展开发。

## Plasmo 框架特点

Plasmo 框架提供了以下核心功能：

### 多平台支持
- 🌐 兼容所有主流浏览器（Chrome、Firefox、Edge、Safari）
- ✅ 同时支持 Manifest V2 和 Manifest V3 规范

### 现代化开发体验
- ⚡ 支持热重载（Hot Reloading），实时更新代码变更
- 📦 内置 TypeScript 支持，提供类型安全
- 🎨 与 React、Vue、Svelte 等现代前端框架无缝集成
- 🔧 自动处理构建和打包流程

### 丰富的扩展组件支持
- 🖼️ Popup 弹出窗口
- 📄 Options 选项页面
- 🌐 Content Scripts 内容脚本
- ⚙️ Background Scripts 后台脚本
- 🆕 New Tab 页面
- 🛠️ Devtools 开发者工具
- 📱 Side Panel 侧边栏面板
- 🏖️ Sandboxed Pages 沙盒页面

### 高效开发工具
- 🚀 快速初始化项目结构
- 📊 内置开发服务器
- 📦 自动化构建和打包
- 🚀 支持一键发布到浏览器扩展商店
- 🧪 集成测试支持

## 快速开始

使用 Plasmo 快速开始浏览器扩展开发的步骤如下：

### 1. 环境准备

确保已安装 Node.js (版本 16+) 和包管理器 (推荐使用 pnpm)：

```bash
# 安装 pnpm（如果尚未安装）
npm install -g pnpm
```

### 2. 初始化项目

使用 Plasmo CLI 初始化新项目：

```bash
pnpx plasmo init
```

或者使用特定模板初始化：

```bash
# 使用 React 模板
pnpx plasmo init --template react

# 使用 TypeScript 模板
pnpx plasmo init --template typescript
```

### 3. 进入项目目录

```bash
cd your-extension-name
```

### 4. 安装依赖

```bash
pnpm install
```

### 5. 启动开发服务器

```bash
pnpm dev
```

这将启动开发服务器并生成适用于 Chrome 的开发版本。

如需开发其他浏览器版本：

```bash
# Firefox
pnpm dev --target=firefox-mv2

# Edge
pnpm dev --target=edge-mv3
```

### 6. 项目结构说明

初始化后的核心目录结构如下：

```html
📂 {rootDir}/                  # 项目根目录
   📁 .plasmo/                 # Plasmo 生成的临时文件
   📁 build/                   # 构建产物目录
   📁 public/                  # 静态资源文件
   📄 package.json             # 项目依赖和脚本配置
   📄 tsconfig.json            # TypeScript 配置
   📄 popup.tsx                # Popup 弹出窗口组件
   📄 content.ts               # Content Script 内容脚本
   📄 background.ts            # Background Script 后台脚本
```

## 核心概念和组件

### 1. 入口点（Entry Points）

Plasmo 使用文件系统作为路由系统，不同的文件名对应不同的扩展组件：

- `popup.tsx` - Popup 弹出窗口
- `options.tsx` - Options 选项页面
- `content.ts` - Content Script 内容脚本
- `background.ts` - Background Script 后台脚本
- `newtab.tsx` - New Tab 新标签页
- `devtools.tsx` - Devtools 开发者工具
- `sidepanel.tsx` - Side Panel 侧边栏面板

### 2. 创建组件示例

#### Popup 组件 (popup.tsx)
```tsx
import { useState } from "react"

function IndexPopup() {
  const [data, setData] = useState("")
  
  return (
    <div style={{ padding: 16 }}>
      <h2>Hello Plasmo!</h2>
      <input 
        onChange={(e) => setData(e.target.value)} 
        value={data} 
        placeholder="Type something..."
      />
      <p>You typed: {data}</p>
    </div>
  )
}

export default IndexPopup
```

#### Content Script (content.ts)
```ts
console.log("Content script loaded!")

// 在页面中执行的代码
document.body.style.border = "5px solid red"
```

#### Background Script (background.ts)
```ts
// 后台脚本，在扩展的生命周期中持续运行
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed!")
})
```

### 3. 配置文件

#### package.json 配置

在 `package.json` 中可以通过 `manifest` 字段配置扩展的权限和设置：

```json
{
  "manifest": {
    "host_permissions": [
      "https://*/*"
    ],
    "permissions": [
      "storage",
      "tabs"
    ]
  }
}
```

## 目录结构详解

### 基础目录结构

```html
📂 {rootDir}/
   📁 .plasmo/                 # Plasmo 临时文件
   📁 build/                   # 构建输出目录
      📁 chrome-mv3-dev/       # Chrome MV3 开发版本
      📁 firefox-mv2-dev/      # Firefox MV2 开发版本
   📁 public/                  # 静态资源（直接复制）
   📄 package.json             # 项目配置
   📄 tsconfig.json            # TypeScript 配置
   📄 popup.tsx                # Popup 组件
   📄 content.ts               # Content Script
   📄 background.ts            # Background Script
```

### 高级目录结构

对于复杂项目，可以使用以下目录结构：

```html
📂 {rootDir}/
   📁 contents/                # 多个 Content Scripts
      📄 index.css             # 共享样式
      📄 modal.tsx             # Modal 组件
      📄 button.tsx            # 按钮组件
   📁 panels/                  # 面板组件
      📁 font-picker/          # 字体选择器
         📄 index.tsx
         📄 index.html
      📁 font-properties/      # 字体属性面板
         📄 index.tsx
         📄 index.html
   📁 sandboxes/               # 沙盒环境
      📄 demo.tsx
      📄 other.tsx
   📁 tabs/                    # 标签页组件
      📄 delta-flyer.tsx
      📄 delta-flyer.html
```

## 开发工作流程

### 1. 开发模式

```bash
# 启动开发服务器
pnpm dev

# 指定浏览器和 Manifest 版本
pnpm dev --target=firefox-mv2
pnpm dev --target=chrome-mv3
```

### 2. 构建生产版本

```bash
# 构建所有目标平台
pnpm build

# 构建特定平台
pnpm build --target=chrome-mv3
pnpm build --target=firefox-mv2
```

### 3. 打包扩展

```bash
# 打包为 ZIP 文件
pnpm package

# 打包特定平台
pnpm package --target=chrome-mv3
```

### 4. 发布扩展

Plasmo 提供了 GitHub Actions 配置来自动化发布流程：

```yaml
# .github/workflows/submit.yml
name: "Submit to Web Store"
on:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Cache pnpm modules
        uses: actions/cache@v3
        with:
          path: ~/.pnpm-store
          key: ${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-
      - uses: pnpm/action-setup@v2.2.4
        with:
          version: latest
          run_install: true
      - name: Use Node.js 16.x
        uses: actions/setup-node@v3.4.1
        with:
          node-version: 16.x
          cache: "pnpm"
      - name: Build the extension
        run: pnpm build
      - name: Package the extension into a zip artifact
        run: pnpm package
      - name: Browser Platform Publish
        uses: PlasmoHQ/bpp@v3
        with:
          keys: ${{ secrets.SUBMIT_KEYS }}
          artifact: build/chrome-mv3-prod.zip
```

## 高级功能

### 1. 消息通信

Plasmo 提供了 `@plasmohq/messaging` 包来简化扩展内部通信：

```bash
pnpm install @plasmohq/messaging
```

使用示例：

```ts
// 发送消息 (popup.tsx)
import { sendToBackground } from "@plasmohq/messaging"

const response = await sendToBackground({
  name: "getData",
  body: { url: "https://example.com" }
})
```

```ts
// 接收消息 (background.ts)
import { Storage } from "@plasmohq/storage"
import { onMessage } from "@plasmohq/messaging"

const storage = new Storage()

onMessage("getData", async (req, res) => {
  const { url } = req.body
  // 处理请求
  const data = await fetchData(url)
  res.send({ data })
})
```

### 2. 存储管理

使用 `@plasmohq/storage` 管理扩展存储：

```bash
pnpm install @plasmohq/storage
```

```ts
import { Storage } from "@plasmohq/storage"

const storage = new Storage()

// 保存数据
await storage.set("key", "value")

// 读取数据
const value = await storage.get("key")
```

### 3. CSS-in-JS 支持

Plasmo 支持多种样式方案：

```tsx
// 内联样式
function MyComponent() {
  return (
    <div style={{ padding: 16, backgroundColor: "#f0f0f0" }}>
      Hello World
    </div>
  )
}
```

```tsx
// CSS 模块
import styles from "./MyComponent.module.css"

function MyComponent() {
  return (
    <div className={styles.container}>
      Hello World
    </div>
  )
}
```

## 最佳实践

### 1. 项目结构组织

对于大型项目，建议按功能模块组织代码：

```
src/
  components/           # 可复用 UI 组件
  contents/             # 内容脚本相关
    ui/                 # 内容脚本 UI 组件
    scripts/            # 内容脚本逻辑
  background/           # 后台脚本相关
    services/           # 后台服务
    utils/              # 后台工具函数
  popup/                # 弹出窗口相关
  options/              # 选项页面相关
  shared/               # 共享代码
    constants/          # 常量
    types/              # TypeScript 类型定义
    utils/              # 共享工具函数
```

### 2. 类型安全

充分利用 TypeScript 提供的类型安全：

```ts
// 定义消息类型
interface GetDataRequest {
  url: string
}

interface GetDataResponse {
  data: any
}

// 在消息通信中使用类型
import { sendToBackground } from "@plasmohq/messaging"

const response = await sendToBackground<GetDataRequest, GetDataResponse>({
  name: "getData",
  body: { url: "https://example.com" }
})
```

### 3. 错误处理

在异步操作中添加适当的错误处理：

```ts
try {
  const response = await fetch("https://api.example.com/data")
  const data = await response.json()
  // 处理数据
} catch (error) {
  console.error("Failed to fetch data:", error)
  // 显示错误信息给用户
}
```

## 常见问题和解决方案

### 1. 权限问题

如果扩展需要特殊权限，在 `package.json` 中配置：

```json
{
  "manifest": {
    "permissions": [
      "storage",
      "tabs",
      "activeTab",
      "scripting"
    ],
    "host_permissions": [
      "https://*/*",
      "http://*/*"
    ]
  }
}
```

### 2. Content Script 注入

确保 Content Script 在正确的页面上运行：

```ts
// content.ts
if (window.location.hostname === "example.com") {
  // 只在 example.com 上运行的代码
  console.log("Running on example.com")
}
```

### 3. 调试技巧

1. 使用浏览器的扩展开发者工具
2. 在后台脚本中使用 `console.log` 输出调试信息
3. 利用 Plasmo 的热重载功能快速测试变更

## 学习资源

- [Plasmo 官方文档](https://docs.plasmo.com/)
- [Plasmo GitHub 仓库](https://github.com/PlasmoHQ/plasmo)
- [Chrome 扩展开发文档](https://developer.chrome.com/docs/extensions/)
- [Mozilla WebExtensions 文档](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Plasmo 示例项目](https://github.com/PlasmoHQ/examples)

通过以上文档，您可以快速上手使用 Plasmo 框架开发功能丰富的浏览器扩展。