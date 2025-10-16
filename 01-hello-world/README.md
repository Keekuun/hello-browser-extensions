# Hello World 扩展

这是 Chrome 扩展开发的基础示例，用于展示如何创建一个简单的浏览器扩展。

## 功能介绍

此扩展展示了最基本的 Chrome 扩展结构，包括：
- manifest.json：扩展的配置文件
- popup.html：点击扩展图标时显示的弹出页面
- popup.js：与弹出页面关联的 JavaScript 脚本

## 学习资源

本项目参考自官方教程 [Hello World extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world)

## 文件说明

- `manifest.json` - 扩展的配置文件，定义了扩展的基本信息和权限
- `hello.html` - 扩展的弹出窗口页面
- `popup.js` - 在弹出窗口中执行的脚本
- `hello_extensions.png` - 扩展图标（需要自行准备）

## 使用方法

1. 在 Chrome 浏览器中打开 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择本项目目录进行加载
5. 加载成功后可以在工具栏看到扩展图标