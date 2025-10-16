# Focus Mode 扩展

为网页添加专注模式功能，隐藏页面上的干扰元素，只显示核心内容，帮助用户专注于阅读。

## 功能介绍

此扩展可以切换网页的专注模式，隐藏页面上除主要内容外的所有干扰元素。特别适用于阅读 Chrome 扩展和 Chrome 网上应用店的官方文档。

支持的页面：
- https://developer.chrome.com/docs/extensions/*
- https://developer.chrome.com/docs/webstore/*

## 学习资源

本项目参考自官方教程 [Inject scripts into the active tab](https://developer.chrome.com/docs/extensions/get-started/tutorial/scripts-activetab)

## 文件说明

- `manifest.json` - 扩展的配置文件，定义了扩展的基本信息、权限和快捷键
- `background.js` - 后台脚本，负责处理扩展图标点击事件和状态管理
- `focus-mode.css` - 专注模式的样式文件，定义了哪些元素需要隐藏和显示
- `images/` - 扩展图标目录，包含不同尺寸的图标

## 工作原理

1. 扩展在安装时会在图标上显示 "OFF" 状态
2. 当用户访问支持的页面并点击扩展图标时，会在当前标签页注入 CSS 样式
3. CSS 样式会隐藏除文章内容外的所有元素，实现专注模式
4. 再次点击图标可切换回正常模式

## 使用方法

### 通过点击扩展图标使用：
1. 在 Chrome 浏览器中打开 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择本项目目录进行加载
5. 访问支持的页面（如 Chrome 扩展文档）
6. 点击扩展图标切换专注模式（图标上会显示 ON/OFF 状态）

### 通过快捷键使用：
- Windows/Linux: Ctrl+B
- Mac: Command+B

## 技术细节

- 使用 `chrome.action.onClicked` 监听扩展图标点击事件
- 使用 `chrome.scripting.insertCSS` 和 `chrome.scripting.removeCSS` 动态注入和移除样式
- 使用 `chrome.action.setBadgeText` 显示扩展当前状态
- 使用 `activeTab` 权限获取当前活动标签页的访问权限
- 使用 `commands` API 定义快捷键