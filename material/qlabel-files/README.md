# 目标
获取指令文本内容和原图图片链接，将结果通过服务器处理，返回处理结果，并在浏览器扩展中显示。

## 分析DOM结构

分析页面DOM结构，找到目标节点选择器：
```js
// 目标节点：元素选择器
const targetImgSelector = 'div.upload-annotation[group="原图"] > div.safe-image > img'
const targetTextSelector = 'div.text-item[group="编辑指令"] > div.text-container > div.text-content > div[name="编辑指令"]'

// 获取文本内容
const targetText = document.querySelector(targetTextSelector).textContent.trim()
textContent = t.textContent.trim()

// 获取图片链接
img = document.querySelector(targetImgSelector).src
```

## 步骤

1. 使用浏览器扩展框架wxt创建一个浏览器扩展，并设置其权限为 `https://qlabel.tencent.com/workbench/tasks/`。
2. 在扩展中添加一个内容脚本，该脚本将在 `https://qlabel.tencent.com/workbench/tasks/` 页面加载时自动执行。
3. 内容脚本的功能包括：
    - 查找页面中的特定文字（例如 "原图"）。
    - 获取与该文字相关联的原图链接。
    - 分析 DOM结构以找到目标节点："原图"和"编辑指令"。
    ```js
    // 目标节点：元素选择器
    const targetImgSelector = 'div.upload-annotation[group="原图"] > div.safe-image > img'
    const targetTextSelector = 'div.text-item[group="编辑指令"] > div.text-container > div.text-content > div[name="编辑指令"]'
    
    // 获取文本内容
    const targetText = document.querySelector(targetTextSelector).textContent.trim()
    textContent = t.textContent.trim()
    
    // 获取图片链接
    img = document.querySelector(targetImgSelector).src
    ```
4. 将获取到的文字和链接,在浏览器扩展弹出页面中显示，并通过消息传递机制发送到扩展的后台脚本或弹出页面，以便用户查看或进一步处理。
5. 在扩展的后台脚本或弹出页面中添加相应的处理逻辑，如：将获取到的文字和链接保存到数据库或文件中，并将其发送到后台服务器。
6. 后台服务器处理逻辑：通过 fetch API 将获取到的文字和链接发送到指定的服务器之后，服务器会返回处理之后的结果（具体为一个新的图片链接）。
7. 将服务器返回的结果显示在扩展的弹出页面中，供用户查看和下载。
8. 测试扩展，确保其能够正确地在 `https://qlabel.com/` 页面上运行，并成功获取所需的文字和链接。
9. 打包并发布扩展，供用户使用。