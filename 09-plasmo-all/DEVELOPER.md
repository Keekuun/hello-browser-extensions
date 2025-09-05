# 开发说明

## 页面说明

+ `content.ts`: 内容脚本，在当前网页上下文中运行于一个隔离的环境中（js 隔离），可以进行dom操作(爬取数据，注入dom等)。
+ `contents/xxx.tsx`: [内容多个脚本](https://docs.plasmo.com/framework/content-scripts-ui)，和`content.ts`脚本功能一样，可以在注入多个，默认导出的组件会通过`shadow dom`注入到当前页面中，`shadow dom`会自动销毁。
+ `popup.tsx`: 点击浏览器扩展图标弹出的页面
+ `options.tsx`: 浏览器扩展的设置页面,鼠标右键点击浏览器扩展会出有**选项**出现在菜单栏中，点击跳转的页面
+ `newtab.tsx`: 可以修改浏览器默认页面，开启扩展浏览器默认页面会被替换
+ `sidepanel.tsx`: 浏览器扩展的侧边栏页面。如果没有`popup.tsx`页面，侧边栏页面会替代`popup.tsx`页面，鼠标左键点击浏览器扩展图标出现的页面。如果存在`popup.tsx`页面，鼠标右键浏览器扩展图标会出现在菜单栏中，点击出现在侧边栏中。
+ `devtools.tsx`: 可以在浏览器扩展开发者调试区域增加入口。
+ `tabs`: 浏览器扩展的标签页页面。通过`chrome-extension://<插件id>/tabs/xxx.html`来访问。
+ `sandbox.ts`: 浏览器扩展的[沙盒环境](https://docs.plasmo.com/framework/sandbox-pages)，可以在iframe中执行员一些隔离操作，然后通过`postMessage`和`popup window`通信。
+ `sandboxes/xxx.tsx`: 浏览器扩展的沙盒页面，可以通过`chrome-extension://<插件id>/sandboxes/xxx.html`来访问。类似于`tabs`
+ `background.ts`: 浏览器扩展的[后台脚本](https://docs.plasmo.com/framework/background-service-worker)，可以在后台运行，通过`chrome.runtime.onMessage`监听消息，并通过`chrome.runtime.sendMessage`发送消息。

## 消息通信

https://docs.plasmo.com/framework/messaging

```bash
pnpm install @plasmohq/messaging
```

