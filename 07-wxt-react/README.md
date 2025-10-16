# WXT + React 扩展

这是一个使用 WXT 框架和 React 开发的浏览器扩展项目模板，帮助您快速开始构建功能丰富的浏览器扩展。

## 功能介绍

此项目模板展示了如何使用现代前端技术栈开发浏览器扩展，包括：
- 使用 WXT 框架简化扩展开发流程
- 集成 React 构建用户界面
- 自动化构建和打包流程
- 支持多种浏览器（Chrome、Firefox等）

## 技术栈

- [WXT](https://github.com/wxt-dev/wxt) - 下一代浏览器扩展开发框架
- [React](https://react.dev/) - 用于构建用户界面的 JavaScript 库
- [Vite](https://vitejs.dev/) - 新一代前端构建工具
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集，提供类型安全

## 项目结构

```
├── .output/                 # 构建输出目录
├── .wxt/                    # WXT 类型定义和配置
├── entrypoints/             # 扩展入口点
│   ├── popup/               # 弹出窗口相关文件
│   ├── background.ts        # 后台脚本
│   └── content.ts           # 内容脚本
├── public/                  # 静态资源文件
├── utils/                   # 工具函数
├── wxt.config.ts            # WXT 配置文件
├── package.json             # 项目依赖和脚本
└── tsconfig.json            # TypeScript 配置
```

## 开发指南

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 为 Chrome 开发
pnpm dev

# 为 Firefox 开发
pnpm dev:firefox
```

### 构建扩展

```bash
# 构建 Chrome 扩展
pnpm build

# 构建 Firefox 扩展
pnpm build:firefox
```

### 打包扩展

```bash
# 打包 Chrome 扩展
pnpm zip

# 打包 Firefox 扩展
pnpm zip:firefox
```

### 类型检查

```bash
pnpm compile
```

## 学习资源

- [WXT 文档](https://wxt.dev/)
- [React 文档](https://react.dev/)
- [Chrome 扩展开发文档](https://developer.chrome.com/docs/extensions/)
- [Mozilla WebExtensions 文档](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

## 文件说明

- `wxt.config.ts` - WXT 配置文件，定义扩展的基本信息和构建选项
- `entrypoints/` - 包含扩展的各种入口点
  - `popup/` - 弹出窗口的 React 应用
  - `background.ts` - 后台服务工作者脚本
  - `content.ts` - 内容脚本
- `.wxt/` - 自动生成的类型定义文件
- `.output/` - 构建生成的扩展文件

## 使用方法

1. 克隆此项目模板
2. 安装依赖: `pnpm install`
3. 开始开发: `pnpm dev`
4. 在浏览器中加载扩展进行测试
   - Chrome: 访问 `chrome://extensions`，开启开发者模式，点击"加载已解压的扩展程序"
   - Firefox: 访问 `about:debugging`，点击"临时加载附加组件"
5. 构建生产版本: `pnpm build`

## 注意事项

- 项目使用 pnpm 作为包管理器
- 使用 TypeScript 提供类型安全
- 使用 React Hooks 进行组件开发
- 开发时会自动热重载，提高开发效率