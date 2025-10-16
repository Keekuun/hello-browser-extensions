# Reading Time 扩展

为网页添加阅读时间统计功能，帮助用户了解阅读文章所需的时间。

## 功能介绍

此扩展会在指定网页的文章内容上方显示阅读时间估算，基于每分钟200词的阅读速度计算。

支持的页面：
- https://developer.chrome.com/docs/extensions/*
- https://developer.chrome.com/docs/webstore/*

## 学习资源

本项目参考自以下官方教程：
- [Run scripts on every page](https://developer.chrome.com/docs/extensions/get-started/tutorial/scripts-on-every-tab)
- [Manifest V3 Content Scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)

## 文件说明

- `manifest.json` - 扩展的配置文件，定义了扩展的基本信息、图标和内容脚本
- `scripts/content.js` - 内容脚本，负责计算和显示阅读时间
- `images/` - 扩展图标目录，包含不同尺寸的图标

## 工作原理

1. 内容脚本会在匹配的页面加载时自动注入
2. 脚本会查找页面中的文章内容（`<article>`元素）
3. 计算文章中的字数并基于每分钟200词的速度估算阅读时间
4. 在文章标题或日期信息后显示阅读时间提示

## 使用方法

1. 在 Chrome 浏览器中打开 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择本项目目录进行加载
5. 访问支持的页面查看阅读时间显示效果

## 技术细节

- 使用 `content_scripts` 在指定页面注入脚本
- 利用 `MutationObserver` 监听单页应用(SPA)的内容变化
- 正则表达式 `[^\s]+` 用于匹配所有非空白字符序列作为单词计算