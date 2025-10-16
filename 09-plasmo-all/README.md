# Plasmo All 功能扩展

这是一个使用 [Plasmo](https://docs.plasmo.com/) 框架开发的浏览器扩展项目，展示了 Plasmo 框架的各种功能和组件。

## 功能介绍

此扩展演示了如何使用 Plasmo 框架开发一个功能完整的浏览器扩展，包括以下组件：
- Popup 弹出窗口
- Content Script 内容脚本
- Background Service Worker 后台服务工作者
- Options 页面
- New Tab 页面
- Devtools 页面
- Side Panel 侧边栏面板
- Sandboxes 沙盒环境

## 技术栈

- [Plasmo](https://docs.plasmo.com/) - 浏览器扩展开发框架
- [React](https://react.dev/) - 用于构建用户界面的 JavaScript 库
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集，提供类型安全

## 项目结构

```
├── .plasmo/                 # Plasmo 构建生成的文件
├── build/                   # 构建输出目录
├── contents/                # 内容脚本组件
├── panels/                  # 面板组件（字体选择器和属性）
├── sandboxes/               # 沙盒环境
├── tabs/                    # 标签页组件
├── background.ts            # 后台服务工作者
├── content.ts               # 内容脚本
├── devtools.tsx            # 开发者工具页面
├── newtab.tsx              # 新标签页
├── options.tsx             # 选项页面
├── popup.tsx               # 弹出窗口
├── sidepanel.tsx           # 侧边栏面板
├── package.json            # 项目依赖和脚本
└── tsconfig.json           # TypeScript 配置
```

## 开发指南

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

开发服务器启动后，会在 `build/` 目录下生成适用于不同浏览器的开发版本。

### 构建生产版本

```bash
pnpm build
```

这将为你的扩展创建一个生产包，准备好进行压缩并发布到应用商店。

## 使用方法

1. 克隆此项目
2. 安装依赖: `pnpm install`
3. 启动开发模式: `pnpm dev`
4. 在浏览器中加载扩展进行测试
   - Chrome: 访问 `chrome://extensions`，开启开发者模式，点击"加载已解压的扩展程序"
   - 选择 `build/chrome-mv3-dev` 目录
5. 构建生产版本: `pnpm build`

## 文件说明

- `popup.tsx` - 扩展弹出窗口的 React 组件
- `content.ts` - 内容脚本，在网页中运行
- `background.ts` - 后台服务工作者，处理后台任务
- `options.tsx` - 扩展选项页面
- `newtab.tsx` - 自定义新标签页
- `devtools.tsx` - 开发者工具面板
- `sidepanel.tsx` - 侧边栏面板
- `sandboxes/` - 沙盒环境组件
- `contents/` - 内容脚本组件和样式
- `panels/` - 各种面板组件

## 学习资源

- [Plasmo 官方文档](https://docs.plasmo.com/)
- [React 文档](https://react.dev/)
- [Chrome 扩展开发文档](https://developer.chrome.com/docs/extensions/)
- [Mozilla WebExtensions 文档](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

## 注意事项

- 项目使用 pnpm 作为包管理器
- 使用 TypeScript 提供类型安全
- 使用 React Hooks 进行组件开发
- 开发时会自动热重载，提高开发效率
- 可以通过修改 manifest 配置来调整扩展权限和功能

## 提交到应用商店

部署 Plasmo 扩展的最简单方法是使用内置的 [bpp](https://bpp.browser.market) GitHub Action。不过，在使用此操作之前，请确保构建扩展并将第一个版本上传到应用商店以建立基本凭证。然后，只需按照[此设置说明](https://docs.plasmo.com/framework/workflows/submit)操作，即可实现自动化提交！