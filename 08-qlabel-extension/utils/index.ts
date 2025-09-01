import {showToast} from "@/components/toast";
import {browser} from "wxt/browser";

export async function downloadImage(url: string, filename: string) {
  browser.downloads.download({url, filename, saveAs: false}).then(() => {
    showToast('图片已下载到本地', 'success');
  }).catch(() => {
    showToast('图片下载失败，请手动保存', 'error');
    window.open(url, '_blank')
  });
}

export async function downloadImageToFile(url: string, filename: string): Promise<File> {
  // 使用 browser.downloads API 下载文件到临时位置
  const downloadId = await browser.downloads.download({
    url: url,
    filename: filename,
    saveAs: false // 不显示保存对话框
  });

  return new Promise<File>((resolve, reject) => {
    browser.downloads.search({id: downloadId}).then((results) => {
      if (results[0] && results[0].state === 'complete' && results[0].filename) {
        const filePath = results[0].filename;
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.open('GET', filePath, true);

        xhr.onload = function() {
          if (xhr.status === 200 || xhr.status === 0) {
            const blob = xhr.response;
            const fileName = filePath.split('/').pop() || filePath;
            const file = new File([blob], fileName, { type: blob.type });
            resolve(file);
          } else {
            reject(new Error('文件读取失败'));
          }
        };

        xhr.onerror = function() {
          reject(new Error('无法访问文件'));
        };

        xhr.send();
      } else {
        reject(new Error('Download failed or file not found'));
      }
    });
  });
}

export async function triggerImgUpload(url: string, filename: string, input: HTMLInputElement) {
  try {
    // 1. 获取图片并转换为File对象
    const response = await fetch(url);
    const blob = await response.blob();
    console.log('Fetched image blob:', blob.type);
    const file = new File([blob], filename, {type: blob.type});

    // 2. 创建DataTransfer对象模拟文件选择
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files;

    // 3. 触发change事件
    const event = new Event('change', {bubbles: true});
    input.dispatchEvent(event);
  } catch (error) {
    showToast(`上传图片失败, 请下载手动上传`, 'error');
    console.error('上传图片失败:', error);
    throw error;
  }
}