import { browser } from 'wxt/browser';
import {showToast} from "@/components/toast";
import {downloadImage} from "@/utils";

// 处理结果
const resultData = {}

document.addEventListener('DOMContentLoaded', () => {
  // 获取DOM元素
  const statusEl = document.getElementById('status')!;
  const taskIdEl = document.getElementById('taskId')!;
  const originalDataEl = document.getElementById('originalData')!;
  const resultSectionEl = document.getElementById('resultSection')!;
  const originalImageEl = document.getElementById('originalImage') as HTMLImageElement;
  const instructionTextEl = document.getElementById('instructionText')!;
  const processBtn = document.getElementById('processBtn') as HTMLButtonElement;
  const pkImgBtn = document.getElementById('pkImgBtn') as HTMLButtonElement;
  const processedImageEl = document.getElementById('processedImage') as HTMLImageElement;
  const downloadLinkEl = document.getElementById('downloadLink') as HTMLAnchorElement;

  // 从 content script 获取目标数据
  const targetData = {
    user: '',
    taskId: Date.now().toString(),
    text: '',
    imageUrl: '',
    timestamp: Date.now()
  }

  // 和 background script 建立消息通道
  const backgroundPort = browser.runtime.connect({ name: 'POPUP_BG_CHANNEL' });
  backgroundPort.onMessage.addListener((message) => {
    console.log("[In content script], received message from background script: ", message);
    if(message.type === 'TASK_RESULT') {
      if(message.success) {
        if(message.data?.image_url) {
          Object.assign(resultData, message.data)
          // 缓存结果到 localStorage
          browser.storage.local.set({[`processed_img_${targetData.taskId}`]: {
              image_url: message.data.image_url,
              timestamp: Date.now(),
              taskId: targetData.taskId
            }});

          displayProcessedImg(message.data.image_url);
          unlockProcessBtn()
          showToast('处理成功，你可以通过图片对比查看效果', 'success');
        }
      } else {
        showToast('处理失败，请稍后再试', 'error');
        unlockProcessBtn()
      }
    }
  });

  window.addEventListener('unload', backgroundPort.disconnect)

  // 获取当前标签页
  browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    const tab = tabs[0];
    if (!tab.id) return;
    displayProcessedImg(resultData.image_url)
    // 从 content script 获取数据
    browser.tabs.sendMessage(tab.id, { type: 'GET_DATA' }).then(data => {
      console.log('[Popup GET_DATA] Received data from content script:', data);
      if (data) {
       // merge data to targetData
        Object.assign(targetData, data)
        displayData();
        // 清理一下缓存
        cleanupExpiredCache();
      } else {
        statusEl.textContent = '未找到数据，请确保在正确的页面上并刷新重试';
      }
    }).catch(error => {
      console.error('获取数据失败:', error);
      statusEl.textContent = '未找到数据，请确保在正确的页面上并刷新重试';
    });
  });

  // 显示DOM数据
  function displayData() {
    statusEl.style.display = 'none';
    originalDataEl.style.display = 'block';

    taskIdEl.textContent = targetData.taskId;
    originalImageEl.src = targetData.imageUrl;
    instructionTextEl.textContent = targetData.text;


    browser.storage.local.get(`processed_img_${targetData.taskId}`).then(result => {
      if (result[`processed_img_${targetData.taskId}`]?.image_url) {
        displayProcessedImg(result[`processed_img_${targetData.taskId}`].image_url)
      } else {
        processImg()
      }
    });
  }

  // 显示处理后的图片
  function displayProcessedImg(processedUrl: string) {
    if(!processedUrl) return
    processedImageEl.src = processedUrl;
    downloadLinkEl.href = processedUrl;
    resultSectionEl.style.display = 'block';

    setTimeout(() => {
      pkImgBtn.scrollIntoView()
    }, 500)
  }

  function lockProcessBtn() {
    processBtn.disabled = true;
    processBtn.textContent = '处理中...';
  }

  function unlockProcessBtn() {
    processBtn.disabled = false;
    processBtn.textContent = '再次处理';
  }

  // 打开图片对比窗口
  pkImgBtn.addEventListener('click', () => {
    const text = instructionTextEl.textContent || '';
    const originalUrl = originalImageEl.src;
    const processedUrl = processedImageEl.src || originalUrl; // 如果没有处理结果，则用原图

    // 打开画中画 90%
    browser.windows.create({
      width: window.screen.availWidth,
      height: window.screen.availHeight - 80,
      left: 0,
      top: 0,
      type: 'popup',
      url: '/img-pk.html?text=' + encodeURIComponent(text) + '&r_img=' + encodeURIComponent(originalUrl) + '&g_img=' + encodeURIComponent(processedUrl),
    })
  });

  function processImg() {
    const text = targetData.text
    const imageUrl = targetData.imageUrl;

    if (!text || !imageUrl) {
      showToast('没有可处理的数据', 'info');
      return;
    }

    lockProcessBtn()

    showToast('图片处理中，请稍后...', 'info');

    // 发送数据到background脚本处理
    browser.runtime.sendMessage({
      type: 'PROCESS_DATA',
      data: targetData,
    })
  }

  // 处理按钮点击事件
  processBtn.addEventListener('click', processImg);

  downloadLinkEl.addEventListener('click', () => {
    downloadImage(downloadLinkEl.href, `效果图—任务ID_${targetData.taskId}.png`);
  })

  // 定期清理过期缓存（例如：超过7天的数据）
  async function cleanupExpiredCache() {
    try {
      const allData = await browser.storage.local.get();
      const now = Date.now();
      const isDev = import.meta.env.DEV;
      const expireTime = isDev ? 30 * 1000 : 7 * 24 * 60 * 60 * 1000; // 7天毫秒数
      const keysToDelete: string[] = [];

      // 检查每个缓存项的时间戳
      Object.keys(allData).forEach(key => {
        // 不删除当前任务的数据
        if (key === 'currentTask') {
          return;
        }
        if (!key.includes(targetData.taskId) && key.startsWith('processed_')) {
          const data = allData[key];
          // 删除过期的缓存项
          if (data && typeof data === 'object' && data.timestamp) {
            if (now - data.timestamp > expireTime) {
              keysToDelete.push(key);
            }
          }
        }
      });

      if (keysToDelete.length > 0) {
        await browser.storage.local.remove(keysToDelete);
        console.warn(`自动清理了 ${keysToDelete.length} 个过期缓存项`);
      }
    } catch (error) {
      console.warn('自动清理缓存失败:', error);
    }
  }
});