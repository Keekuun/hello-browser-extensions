# WXT 浏览器扩展实现方案

根据需求，我们将使用 WXT 框架创建一个浏览器扩展，实现从指定页面提取指令文本和原图链接，并与服务器交互展示处理结果。

## 1. 项目初始化

首先创建 WXT 项目：

```bash
pnpm dlx wxt@latest init qlabel-extension --template vanilla --pm pnpm
cd qlabel-extension
```

## 2. 配置文件修改（wxt.config.ts）

```typescript
import { defineConfig } from 'wxt';

export default defineConfig({
  manifestVersion: 3,
  manifest: {
    name: 'QLabel 助手',
    description: '提取QLabel页面的指令和图片并处理',
    version: '1.0',
    permissions: ['activeTab', 'storage'],
    host_permissions: ['https://qlabel.tencent.com/workbench/tasks/*'],
    action: {
      default_popup: 'popup.html',
      default_icon: {
        16: 'icons/icon-16.png',
        48: 'icons/icon-48.png',
        128: 'icons/icon-128.png'
      }
    },
    icons: {
      16: 'icons/icon-16.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png'
    }
  },
  modules: ['@wxt-dev/auto-icons'],
  autoIcons: {
    sizes: [128, 48, 32, 16], // 覆盖默认尺寸，添加32px
    developmentIndicator: 'overlay', // 开发模式显示黄色"DEV"覆盖层
  },
});
```

## 3. 创建内容脚本（entrypoints/content.ts）

```typescript
import { defineContentScript } from 'wxt/content-scripts';
import { browser } from 'wxt/browser';

export default defineContentScript({
  matches: ['https://qlabel.tencent.com/workbench/tasks/*'],
  main() {
    // 目标节点选择器
    const targetImgSelector = 'div.upload-annotation[group="原图"] > div.safe-image > img';
    const targetTextSelector = 'div.text-item[group="编辑指令"] > div.text-container > div.text-content > div[name="编辑指令"]';
    
    // 定期检查元素是否加载完成
    const checkElements = setInterval(() => {
      // 获取文本内容
      const textElement = document.querySelector(targetTextSelector);
      const targetText = textElement ? textElement.textContent?.trim() : '';
      
      // 获取图片链接
      const imgElement = document.querySelector(targetImgSelector);
      const imgUrl = imgElement ? imgElement.src : '';
      
      // 当两个元素都找到时
      if (targetText && imgUrl) {
        clearInterval(checkElements);
        
        // 存储数据到本地
        browser.storage.local.set({
          qlabelData: {
            text: targetText,
            imageUrl: imgUrl,
            timestamp: new Date().getTime()
          }
        });
        
        // 发送消息通知数据已准备好
        browser.runtime.sendMessage({
          type: 'DATA_READY',
          data: { text: targetText, imageUrl: imgUrl }
        });
      }
    }, 500); // 每500ms检查一次
    
    // 监听来自popup的请求
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'GET_DATA') {
        browser.storage.local.get('qlabelData').then(result => {
          sendResponse(result.qlabelData || null);
        });
        return true; // 异步响应
      }
    });
  }
});
```

## 4. 创建背景脚本（entrypoints/background.ts）

```typescript
import { defineBackground } from 'wxt/background';
import { browser } from 'wxt/browser';

export default defineBackground(() => {
  // 服务器处理函数
  async function processData(text: string, imageUrl: string) {
    try {
      // 替换为你的服务器地址
      const response = await fetch('https://your-server.com/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          imageUrl: imageUrl
        }),
      });
      
      if (!response.ok) {
        throw new Error(`服务器响应错误: ${response.status}`);
      }
      
      const result = await response.json();
      return result.processedImageUrl; // 假设服务器返回处理后的图片URL
    } catch (error) {
      console.error('处理数据时出错:', error);
      throw error;
    }
  }
  
  // 监听消息
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // 处理来自popup的处理请求
    if (message.type === 'PROCESS_DATA') {
      processData(message.text, message.imageUrl)
        .then(processedUrl => {
          sendResponse({ success: true, processedUrl });
        })
        .catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      return true; // 异步响应
    }
  });
});
```

## 5. 创建弹出页面

### 5.1 弹出页面HTML（entrypoints/popup.html）

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>QLabel 助手</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="container">
    <h1>QLabel 助手</h1>
    
    <div class="status" id="status">加载中...</div>
    
    <div class="section" id="originalData" style="display: none;">
      <h2>原图</h2>
      <img id="originalImage" class="image" />
      
      <h2>编辑指令</h2>
      <div id="instructionText" class="text-content"></div>
      
      <button id="processBtn">发送到服务器处理</button>
    </div>
    
    <div class="section" id="resultSection" style="display: none;">
      <h2>处理结果</h2>
      <img id="processedImage" class="image" />
      <a id="downloadLink" class="download-btn" download>下载图片</a>
    </div>
  </div>
  <script src="popup.ts" type="module"></script>
</body>
</html>
```

### 5.2 弹出页面样式（entrypoints/popup.css）

```css
.container {
  width: 350px;
  padding: 15px;
  font-family: Arial, sans-serif;
}

h1 {
  font-size: 18px;
  margin: 0 0 15px 0;
  color: #333;
}

h2 {
  font-size: 16px;
  margin: 15px 0 10px 0;
  color: #555;
}

.status {
  color: #666;
  padding: 10px;
  text-align: center;
}

.section {
  margin-bottom: 20px;
}

.image {
  max-width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
}

.text-content {
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  word-break: break-word;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #0078d7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
}

button:hover {
  background-color: #005a9e;
}

.download-btn {
  display: inline-block;
  margin-top: 10px;
  color: #0078d7;
  text-decoration: none;
}

.download-btn:hover {
  text-decoration: underline;
}
```

### 5.3 弹出页面脚本（entrypoints/popup.ts）

```typescript
import { browser } from 'wxt/browser';

document.addEventListener('DOMContentLoaded', () => {
  // 获取DOM元素
  const statusEl = document.getElementById('status')!;
  const originalDataEl = document.getElementById('originalData')!;
  const resultSectionEl = document.getElementById('resultSection')!;
  const originalImageEl = document.getElementById('originalImage') as HTMLImageElement;
  const instructionTextEl = document.getElementById('instructionText')!;
  const processBtn = document.getElementById('processBtn')!;
  const processedImageEl = document.getElementById('processedImage') as HTMLImageElement;
  const downloadLinkEl = document.getElementById('downloadLink') as HTMLAnchorElement;
  
  // 获取当前标签页
  browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    const tab = tabs[0];
    if (!tab.id) return;
    
    // 从内容脚本获取数据
    browser.tabs.sendMessage(tab.id, { type: 'GET_DATA' }).then(data => {
      if (data) {
        displayData(data);
      } else {
        statusEl.textContent = '未找到数据，请确保在正确的页面上并刷新重试';
      }
    }).catch(error => {
      console.error('获取数据失败:', error);
      statusEl.textContent = '无法获取数据，请刷新页面重试';
    });
  });
  
  // 显示获取到的数据
  function displayData(data: { text: string, imageUrl: string }) {
    statusEl.style.display = 'none';
    originalDataEl.style.display = 'block';
    
    originalImageEl.src = data.imageUrl;
    instructionTextEl.textContent = data.text;
  }
  
  // 处理按钮点击事件
  processBtn.addEventListener('click', () => {
    const text = instructionTextEl.textContent || '';
    const imageUrl = originalImageEl.src;
    
    if (!text || !imageUrl) {
      alert('没有可处理的数据');
      return;
    }
    
    processBtn.disabled = true;
    processBtn.textContent = '处理中...';
    
    // 发送数据到背景脚本处理
    browser.runtime.sendMessage({
      type: 'PROCESS_DATA',
      text: text,
      imageUrl: imageUrl
    }).then(response => {
      processBtn.disabled = false;
      processBtn.textContent = '发送到服务器处理';
      
      if (response.success && response.processedUrl) {
        processedImageEl.src = response.processedUrl;
        downloadLinkEl.href = response.processedUrl;
        resultSectionEl.style.display = 'block';
      } else {
        alert('处理失败: ' + (response.error || '未知错误'));
      }
    });
  });
});
```

## 6. 运行与测试

```bash
# 开发模式
pnpm run dev

# 构建生产版本
pnpm run build

# 打包扩展
pnpm run zip
```

## 7. 项目结构说明

```
qlabel-extension/
├── entrypoints/
│   ├── content.ts        # 内容脚本，负责提取页面数据
│   ├── background.ts     # 背景脚本，负责与服务器通信
│   ├── popup.html        # 弹出页面HTML
│   ├── popup.css         # 弹出页面样式
│   └── popup.ts          # 弹出页面脚本
├── public/
│   └── icons/            # 扩展图标
├── wxt.config.ts         # WXT配置文件
└── package.json
```

## 注意事项

1. 替换代码中的服务器地址为实际的后端服务地址
2. 确保图标文件存在于 `public/icons/` 目录下
3. 测试时需要先在浏览器中加载 unpacked 扩展（使用 build 后的 dist 目录）
4. 若页面加载较慢，可适当调整内容脚本中的检查间隔时间

这个扩展实现了所有需求功能：自动提取指定页面的指令文本和原图链接，通过服务器处理后展示结果，并提供下载功能。