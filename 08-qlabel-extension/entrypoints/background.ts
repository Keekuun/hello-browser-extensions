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
      const testImg = "https://th.bing.com/th/id/R.8e13b5235129bf3759c350822d787d27?rik=O%2bKS%2bC1l%2f%2b%2fHzA&riu=http%3a%2f%2fseopic.699pic.com%2fphoto%2f50057%2f5834.jpg_wh1200.jpg&ehk=YSJfy459n%2fmU8xTzi31ahDbFmge0TteZDiWwoEbWDvg%3d&risl=&pid=ImgRaw&r=0"
      browser.storage.local.set({ [`processed_${data.taskId}`]: testImg });
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