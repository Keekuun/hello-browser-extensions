import { browser } from 'wxt/browser';
import {showToast} from "@/components/toast";

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
      statusEl.textContent = '未找到数据，请确保在正确的页面上并刷新重试';
    });
  });

  // 显示已经处理的数据
  function displayData(data: { text: string, imageUrl: string, taskId: string }) {
    statusEl.style.display = 'none';
    originalDataEl.style.display = 'block';

    taskIdEl.textContent = data.taskId;
    originalImageEl.src = data.imageUrl;
    instructionTextEl.textContent = data.text;

    getEffectImage(data.taskId)
  }

  // 获取效果图片
  let timer: string | number | NodeJS.Timeout | undefined;
  function getEffectImage(taskId: string) {
    if(timer) {
      clearInterval(timer)
      timer = undefined;
    }
    timer = setInterval(() => {
      // 看是否已经生成过了
      browser.storage.local.get(`processed_${taskId}`).then(result => {
        console.log('result:', result)
        const processedUrl = result[`processed_${taskId}`];
        if (processedUrl) {
          clearInterval(timer);
          timer = undefined;
          processedImageEl.src = processedUrl;
          downloadLinkEl.href = processedUrl;
          resultSectionEl.style.display = 'block';
        }
      });
    }, 500)
  }

  // 去对比
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

  // 处理按钮点击事件
  processBtn.addEventListener('click', () => {
    const text = instructionTextEl.textContent || '';
    const imageUrl = originalImageEl.src;
    const taskId = taskIdEl.textContent;

    if (!text || !imageUrl) {
      alert('没有可处理的数据');
      return;
    }

    processBtn.disabled = true;
    processBtn.textContent = '处理中..';

    showToast('服务器努力处理中，请稍后..', 'info');
    // 发送数据到背景脚本处理
    browser.runtime.sendMessage({
      type: 'PROCESS_DATA',
    }).then(response => {
      processBtn.disabled = false;
      processBtn.textContent = '处理图片';

      if (response.success && response.processedUrl) {
        processedImageEl.src = response.processedUrl;
        downloadLinkEl.href = response.processedUrl;
        resultSectionEl.style.display = 'block';
        showToast('处理成功，你可以通过图片对比查看效果', 'success');
      } else {
        showToast('处理失败: ' + (response.error || '未知错误'), 'error');
      }
    }).catch(error => {
      processBtn.disabled = false;
      processBtn.textContent = '处理图片';
      showToast('处理失败: ' + error.message, 'error');
    });
  });
});