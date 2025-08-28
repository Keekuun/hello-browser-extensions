import {showToast} from "@/components/toast";

export async function delay(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

export async function downloadImage(url: string, filename: string) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
  } catch (error) {
    window.open(url, '_blank')
  }
}

export async function triggerImgUpload(url: string, filename: string, input: HTMLInputElement) {
  try {
    // 1. 获取图片并转换为File对象
    const response = await fetch(url);
    const blob = await response.blob();
    console.log('Fetched image blob:', blob.type);
    const file = new File([blob], filename, { type: blob.type });

    // 2. 创建DataTransfer对象模拟文件选择
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files;

    // 3. 触发change事件
    const event = new Event('change', { bubbles: true });
    input.dispatchEvent(event);
  } catch (error) {
    showToast(`上传图片失败, 请下载手动上传`, 'error');
    console.error('上传图片失败:', error);
    throw error;
  }
}

// 	https://tests3.boychat.net/icon/1013444