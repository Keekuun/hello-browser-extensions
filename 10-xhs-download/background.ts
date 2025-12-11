// background.ts
import JSZip from 'jszip'

// 存储正在下载的文件信息，避免重复下载
interface DownloadingItem {
  url: string; // 图片URL或ZIP文件标识
  filename: string;
  startTime: number;
}

const downloadingFiles: Set<string> = new Set();

// 检查文件是否正在下载
function isDownloading(url: string, filename: string): boolean {
  const key = `${url}-${filename}`;
  return downloadingFiles.has(key);
}

// 添加到正在下载列表
function addToDownloading(url: string, filename: string): void {
  const key = `${url}-${filename}`;
  downloadingFiles.add(key);
}

// 从正在下载列表中移除
function removeFromDownloading(url: string, filename: string): void {
  const key = `${url}-${filename}`;
  downloadingFiles.delete(key);
}

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'downloadImage') {
    downloadImage(message.url, message.filename)
      .then(() => {
        sendResponse({ success: true })
      })
      .catch(error => {
        console.error('下载失败:', error)
        sendResponse({ success: false, error: error.message })
      })
    return true // 表示会异步发送响应
  } else if (message.action === 'downloadImages') {
    downloadImages(message.images, message.postTitle)
      .then(() => {
        sendResponse({ success: true })
      })
      .catch(error => {
        console.error('下载失败:', error)
        sendResponse({ success: false, error: error.message })
      })
    return true // 表示会异步发送响应
  }
})

// 清理文件名，确保符合Chrome downloads API要求
function sanitizeFilename(filename: string): string {
  // 移除Chrome downloads API不允许的特殊字符：\ / : * ? " < > |
  let sanitized = filename.replace(/[\\/:*?"<>|]/g, '_')
  // 移除多余的下划线
  sanitized = sanitized.replace(/_+/g, '_')
  // 移除文件名首尾的空格和下划线
  sanitized = sanitized.trim().replace(/^_+|_+$/g, '')
  // 如果文件名为空，使用默认值
  if (!sanitized) {
    sanitized = 'xhs-image'
  }
  return sanitized
}

// 下载单张图片
async function downloadImage(url: string, filename: string) {
  // 检查是否正在下载
  if (isDownloading(url, filename)) {
    throw new Error('该文件正在下载中，请勿重复下载');
  }
  
  // 添加到正在下载列表
  addToDownloading(url, filename);
  
  try {
    const response = await fetch(url, {
    mode: 'cors',
    credentials: 'omit'
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  const blob = await response.blob()
  
  // 清理文件名
  filename = sanitizeFilename(filename)
  
  // 确保文件名包含正确的扩展名
  const hasExtension = /\.[a-zA-Z0-9]+$/.test(filename)
  if (!hasExtension) {
    // 从blob类型中获取扩展名
    const ext = blob.type.split('/')[1] || 'jpg'
    filename = `${filename}.${ext}`
  }
  
  // 在Service Worker中，使用FileReader将blob转换为data URL
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
  
  // 使用chrome.downloads API下载文件
  return new Promise<void>((resolve, reject) => {
    chrome.downloads.download({
      url: dataUrl,
      filename: filename,
      saveAs: false // 不显示保存对话框，静默下载
    }, (downloadId) => {
      // 无论成功失败，都从正在下载列表中移除
      removeFromDownloading(url, filename);
      
      if (downloadId) {
        resolve()
      } else {
        reject(new Error('下载失败'))
      }
    })
  })
  } catch (error) {
    // 发生错误时，从正在下载列表中移除
    removeFromDownloading(url, filename);
    throw error;
  }
}

// 下载多张图片并打包为ZIP
async function downloadImages(images: string[], postTitle: string) {
  // 生成ZIP文件标识（使用图片URL的哈希值和标题组合）
  const imagesHash = images.sort().join('').replace(/[^a-zA-Z0-9]/g, '');
  const zipFilename = `${sanitizeFilename(postTitle)}-images.zip`;
  const zipIdentifier = `${imagesHash}-${zipFilename}`;
  
  // 检查是否正在下载
  if (isDownloading(zipIdentifier, zipFilename)) {
    throw new Error('该图片集正在下载中，请勿重复下载');
  }
  
  // 添加到正在下载列表
  addToDownloading(zipIdentifier, zipFilename);
  
  try {
    const zip = new JSZip()
    // 清理文件名
    const sanitizedPostTitle = sanitizeFilename(postTitle)
    const zipFilename = `${sanitizedPostTitle}-images.zip`

  // 下载所有图片
  for (let i = 0; i < images.length; i++) {
    const imgUrl = images[i]
    const response = await fetch(imgUrl, {
      mode: 'cors',
      credentials: 'omit'
    })
    
    if (!response.ok) {
      throw new Error(`下载图片失败: ${imgUrl}`)
    }
    
    const blob = await response.blob()
    // 获取图片扩展名
    const ext = blob.type.split('/')[1] || 'jpg'
    // 添加到zip
    zip.file(`${sanitizedPostTitle}-${i + 1}.${ext}`, blob)
  }
  
  // 创建包含所有图片链接的txt文件
  const linksContent = images.map((url, index) => `${index + 1}. ${url}`).join('\n')
  zip.file(`${sanitizedPostTitle}-image-links.txt`, linksContent)
  
  // 生成zip文件
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  
  // 在Service Worker中，使用FileReader将zip blob转换为data URL
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(zipBlob)
  })
  
  // 使用chrome.downloads API下载zip文件
  return new Promise<void>((resolve, reject) => {
    chrome.downloads.download({
      url: dataUrl,
      filename: zipFilename,
      saveAs: false // 不显示保存对话框，静默下载
    }, (downloadId) => {
      // 无论成功失败，都从正在下载列表中移除
      removeFromDownloading(zipIdentifier, zipFilename);
      
      if (downloadId) {
        resolve()
      } else {
        reject(new Error('下载失败'))
      }
    })
  })
  } catch (error) {
    // 发生错误时，从正在下载列表中移除
    removeFromDownloading(zipIdentifier, zipFilename);
    throw error;
  }
}
