# Quick API Reference 扩展

这是一个功能丰富的 Chrome 扩展，演示了如何使用 Service Worker 处理后台任务、Omnibox API 提供快速搜索功能，以及 Chrome Alarms API 定期执行任务。

## 功能介绍

1. **Service Worker 后台任务处理**：使用 Service Worker 运行后台任务，例如发送 fetch 请求获取数据或与其他页面通信。
2. **Omnibox 快速搜索**：通过浏览器地址栏快速搜索 Chrome Extension API 或 Web API。
3. **定期任务执行**：使用 Chrome Alarms API 定期运行任务，替代传统的 setTimeout 或 setInterval 方法。
4. **内容脚本提示功能**：在指定页面显示提示信息，使用现代 Popover API 实现。

## 学习资源

本项目参考自以下官方教程和文档：
- [Handle events with service workers](https://developer.chrome.com/docs/extensions/get-started/tutorial/service-worker-events)
- [omnibox](https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions/API/omnibox)
- [service worker 数据持久化](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle#persist-data)
- [popover](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/popover)

## 文件说明

- `manifest.json` - 扩展的配置文件，定义了扩展的基本信息、权限和功能
- `service-worker.js` - 主要的 Service Worker 文件，导入其他功能模块
- `sw-omnibox.js` - Omnibox 功能实现，提供 Chrome Extension API 搜索
- `sw-omnibox-caniuse.js` - Omnibox 功能实现，提供 Web API 搜索 (当前启用)
- `sw-tips.js` - 定期获取和显示开发技巧的实现
- `content.js` - 内容脚本，在页面中显示提示按钮和信息
- `images/` - 扩展图标目录，包含不同尺寸的图标

## 工作原理

### Service Worker
Service Worker 是一种特殊的 JavaScript 文件，在后台运行，即使没有打开扩展页面也能保持活跃状态。它可以处理各种事件，如 alarms、storage 变化等。

### Omnibox API
通过在地址栏输入特定关键词触发扩展功能：
- 关键词: `caniuse`
- 使用方法: 在地址栏输入 `caniuse [API名称]` 即可搜索 Web API 兼容性信息

### Chrome Alarms API
用于定期执行任务，避免使用 setTimeout 或 setInterval，因为 Service Worker 可能会被终止。

### Popover API
现代 HTML 特性，用于显示弹出内容，替代传统的模态框或 tooltip。

## 使用方法

1. 在 Chrome 浏览器中打开 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择本项目目录进行加载

### 使用 Omnibox 功能
1. 在地址栏输入 `caniuse`
2. 按空格输入要查询的 Web API 名称
3. 从建议列表中选择或直接按回车搜索

### 查看提示功能
1. 访问 https://developer.chrome.com/docs/extensions/reference/*
2. 页面顶部会出现"插件提示按钮"
3. 点击按钮查看开发技巧

## 技术细节

- 使用 ES6 Module 方式组织代码 (`type: module`)
- 使用 `chrome.storage.local` 进行数据持久化存储
- 使用 `chrome.alarms` API 定期执行后台任务
- 使用 `chrome.omnibox` API 实现地址栏搜索功能
- 使用现代 Web API 如 Popover API 实现用户界面
- 使用 Content Script 在特定页面注入功能
- 最低支持 Chrome 版本: 102

## 注意事项

- Service Worker 有生命周期限制，可能会被终止和重启
- 数据持久化应使用 `chrome.storage` API 而不是 localStorage
- 需要在 manifest.json 中声明相应权限才能使用各项 API