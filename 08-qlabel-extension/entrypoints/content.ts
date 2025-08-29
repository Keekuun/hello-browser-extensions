import {browser} from 'wxt/browser';
import {createInflate} from "node:zlib";

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
    const targetImgSelector = 'div.upload-annotation[group] > div.safe-image > img';
    const targetTextSelector = 'div.text-item[group] > div.text-container > div.text-content > div[name]';

    // 图片上传目标dom节点
    const targetFileInputSelector = 'div.t-upload > input[type=file]'

    // 定期检查元素是否加载完成
    const checkElements = setInterval(getDomData, 200);

    function getDomData() {
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
    }

    // 监听来自popup或background的刷新请求
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'refreshDomData') {
        // 执行刷新并返回最新数据
        getDomData()
        sendResponse({ status: 'success', data: targetData });
      }
    });

    // 监听来自popup的请求
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'GET_DATA') {
        sendResponse(targetData);
        return true; // 保持消息通道打开以发送异步响应
      }
      if (message.type === 'UPLOAD_IMG') {
        const fileInput = document.querySelector(targetFileInputSelector) as HTMLInputElement | null;
        if (fileInput) {
          import('@/utils').then(({triggerImgUpload}) => {
            triggerImgUpload(message.data.url, message.data.filename, fileInput).then(() => {
              sendResponse({ success: true });
            }).catch((error) => {
              sendResponse({ success: false, error: error.message });
            });
          });
          return true; // 保持消息通道打开以发送异步响应
        } else {
          console.error('未找到文件输入元素');
          sendResponse({ success: false, error: 'File input element not found' });
        }
      }
    });
  }
});