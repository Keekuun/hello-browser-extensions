# Tabs Manager 扩展

为浏览器添加标签页分组和管理功能，帮助用户更好地组织和管理 Chrome 开发者文档相关的标签页。

## 功能介绍

此扩展专门用于管理 Chrome 开发者文档网站的标签页，提供以下功能：

1. **标签页列表显示**：列出所有打开的 Chrome 开发者文档标签页
2. **标签页分组**：将相关标签页自动分组以便更好管理
3. **标签页取消分组**：将已分组的标签页解散
4. **标签页切换**：快速激活选中的标签页
5. **智能分组切换**：一键在分组和取消分组之间切换
6. **通知提醒**：操作完成后显示通知提醒

支持的域名：
- https://developer.chrome.com/*

## 学习资源

本项目参考自官方教程 [Manage tabs](https://developer.chrome.com/docs/extensions/get-started/tutorial/popup-tabs-manager)

## 文件说明

- `manifest.json` - 扩展的配置文件，定义了扩展的基本信息、权限和弹出页面
- `popup.html` - 扩展弹出窗口的 HTML 结构
- `popup.css` - 弹出窗口的样式文件
- `popup.js` - 弹出窗口的主要逻辑代码
- `images/` - 扩展图标目录，包含不同尺寸的图标

## 工作原理

1. 扩展会查询所有打开的 Chrome 开发者文档相关标签页
2. 将这些标签页按照标题进行排序并在弹出窗口中显示
3. 用户可以通过点击条目快速切换到对应标签页
4. 提供分组、取消分组和切换分组状态的功能按钮
5. 使用 Chrome Notifications API 显示操作结果通知

## 使用方法

1. 在 Chrome 浏览器中打开 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择本项目目录进行加载
5. 打开一些 Chrome 开发者文档页面
6. 点击扩展图标打开弹出窗口

在弹出窗口中，您可以：
- 点击任意标签页条目快速切换到该标签页
- 点击"Group Tabs"按钮将所有相关标签页分组
- 点击"UnGroup Tabs"按钮将已分组的标签页解散
- 点击"Toggle Tabs"按钮在分组和取消分组之间切换

## 技术细节

- 使用 `chrome.tabs.query` 查询特定 URL 模式的标签页
- 使用 `Intl.Collator` 对标签页标题进行本地化排序
- 使用 `chrome.tabs.group` 和 `chrome.tabs.ungroup` 进行标签页分组操作
- 使用 `chrome.tabGroups.update` 更新分组标题
- 使用 `chrome.notifications.create` 创建桌面通知
- 使用 HTML Template 元素动态生成标签页列表
- 使用 CSS 实现交替行背景色的视觉效果
- 使用 ES6 模块方式加载 JavaScript (`type="module"`)

## 权限说明

- `tabGroups`：用于对标签页进行分组操作
- `notifications`：用于显示操作结果通知
- `host_permissions`：用于访问 https://developer.chrome.com/* 域名下的标签页信息