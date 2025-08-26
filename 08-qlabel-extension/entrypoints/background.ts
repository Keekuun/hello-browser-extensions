import { browser } from 'wxt/browser';

export default defineBackground(() => {
  // 服务器处理函数
  async function processData(data: any) {
    try {
      // todo: 替换为你的服务器地址
      const response = await fetch('https://your-server.com/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data
        }),
      });

      if (!response.ok) {
        throw new Error(`服务器响应错误: ${response.status}`);
      }

      const result = await response.json();
      // todo 保存当前处理结果
      browser.storage.local.set({ [`processed_${data.taskId}`]: result.processedImageUrl });
      return result.processedImageUrl; // 假设服务器返回处理后的图片URL
    } catch (error) {
      console.error('处理数据时出错:', error);
      browser.storage.local.set({ [`processed_${data.taskId}`]: 'http://localhost:63342/hello-browser-extensions/material/qlabel-files/qlabel/f9aca0bde6ac0a05f9635ae01f228657_b432a7ca3f05f6d285a50ec6ff3a1109.jpeg' });
      throw error;
    }
  }

  // 监听消息
  browser.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
    // 处理来自popup的处理请求
    if (message.type === 'PROCESS_DATA') {
      const { qlabelData } = await browser.storage.local.get('qlabelData');
      console.log('Background get data:', qlabelData);

      processData(qlabelData)
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