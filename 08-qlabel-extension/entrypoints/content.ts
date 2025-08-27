import {browser} from 'wxt/browser';

export default defineContentScript({
  matches: ['https://qlabel.tencent.com/workbench/tasks/*', "http://localhost/*"],
  main() {
    const targetData = {
      user: '',
      taskId: Date.now().toString(),
      text: '',
      imageUrl: '',
      timestamp: Date.now()
    }

    // 目标节点选择器
    const taskIdSelector = 'div.z-level__item.z-header__logo > p > span:nth-child(2)';
    const targetImgSelector = 'div.upload-annotation[group="原图"] > div.safe-image > img';
    const targetTextSelector = 'div.text-item[group="编辑指令"] > div.text-container > div.text-content > div[name="编辑指令"]';

    // 定期检查元素是否加载完成
    const checkElements = setInterval(() => {
      // 获取任务id
      const taskIdElement = document.querySelector(taskIdSelector);
      const taskId = taskIdElement?.textContent?.trim()?.split(/[:：]/)?.[1]?.trim() || Date.now().toString();
      // 获取文本内容
      const textElement = document.querySelector(targetTextSelector);
      const targetText = textElement?.textContent?.trim() ?? '';

      // 获取图片链接
      const imgElement = document.querySelector(targetImgSelector) as HTMLImageElement | null;
      const imgUrl = imgElement?.src;

      // 当前登陆的用户email在localStorage中
      const user = localStorage.getItem('email') || 'unknown_user';
      console.log(`User: ${user}, Task ID: ${taskId}, Text: ${targetText}, Image URL: ${imgUrl}`);

      // 当两个元素都找到时
      if (targetText && imgUrl) {
        clearInterval(checkElements);

        Object.assign(targetData, {
          user,
          taskId,
          text: targetText,
          imageUrl: imgUrl,
          timestamp: new Date().getTime()
        })

        // 发送消息通知background数据已准备好
        browser.runtime.sendMessage({
          type: 'DATA_READY',
          data: targetData
        });
      }
    }, 200);

    // 监听来自popup的请求
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'GET_DATA') {
        sendResponse(targetData);
        return true; // 保持消息通道打开以发送异步响应
      }
    });
  }
});