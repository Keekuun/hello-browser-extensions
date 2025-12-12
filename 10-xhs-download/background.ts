// background.ts
import JSZip from 'jszip'

// 定义消息类型接口
interface DownloadImageMessage {
  action: 'downloadImage';
  url: string;
  filename: string;
}

interface DownloadImagesMessage {
  action: 'downloadImages';
  images: string[];
  postTitle: string;
}

type BackgroundMessage = DownloadImageMessage | DownloadImagesMessage;

// 存储正在下载的文件信息，避免重复下载
interface DownloadingItem {
  url: string; // 图片URL或ZIP文件标识
  filename: string;
  startTime: number;
}

// 使用Map代替Set，存储更多下载信息
const downloadingMap: Map<string, DownloadingItem> = new Map();

// 清理过期的下载记录（超过5分钟的下载记录自动清理）
setInterval(() => {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  
  downloadingMap.forEach((item, key) => {
    if (item.startTime < fiveMinutesAgo) {
      downloadingMap.delete(key);
    }
  });
}, 60 * 1000); // 每分钟检查一次

// 生成下载键
function generateDownloadKey(url: string, filename: string): string {
  return `${url}-${filename}`;
}

// 检查文件是否正在下载
function isDownloading(url: string, filename: string): boolean {
  const key = generateDownloadKey(url, filename);
  return downloadingMap.has(key);
}

// 添加到正在下载列表
function addToDownloading(url: string, filename: string): void {
  const key = generateDownloadKey(url, filename);
  downloadingMap.set(key, {
    url,
    filename,
    startTime: Date.now()
  });
}

// 从正在下载列表中移除
function removeFromDownloading(url: string, filename: string): void {
  const key = generateDownloadKey(url, filename);
  downloadingMap.delete(key);
}

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message: BackgroundMessage, sender, sendResponse) => {
  if (message.action === 'downloadImage') {
    downloadImage(message.url, message.filename)
      .then(() => {
        sendResponse({ success: true })
      })
      .catch(error => {
        console.error('单张图片下载失败:', error)
        sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) })
      })
    return true // 表示会异步发送响应
  } else if (message.action === 'downloadImages') {
    downloadImages(message.images, message.postTitle)
      .then(() => {
        sendResponse({ success: true })
      })
      .catch(error => {
        console.error('多张图片下载失败:', error)
        sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) })
      })
    return true // 表示会异步发送响应
  }
  
  // 处理未知消息类型
  sendResponse({ success: false, error: '未知的请求类型' })
  return false
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

// 从blob创建data URL
async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// 使用chrome.downloads API下载文件
async function downloadFile(dataUrl: string, filename: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    chrome.downloads.download({
      url: dataUrl,
      filename: filename,
      saveAs: false // 不显示保存对话框，静默下载
    }, (downloadId) => {
      if (downloadId) {
        resolve()
      } else {
        reject(new Error('下载失败：无法创建下载任务'))
      }
    })
  })
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
    // 发送CORS请求获取图片
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'image/*'
      }
    })
    
    if (!response.ok) {
      throw new Error(`下载失败：HTTP错误 ${response.status} ${response.statusText}`)
    }
    
    const blob = await response.blob()
    
    // 验证是否为图片类型
    if (!blob.type.startsWith('image/')) {
      throw new Error(`下载失败：不是有效的图片文件，类型为 ${blob.type}`)
    }
    
    // 清理文件名
    filename = sanitizeFilename(filename)
    
    // 确保文件名包含正确的扩展名
    const hasExtension = /\.[a-zA-Z0-9]+$/.test(filename)
    if (!hasExtension) {
      // 从blob类型中获取扩展名
      const ext = blob.type.split('/')[1] || 'jpg'
      filename = `${filename}.${ext}`
    }
    
    // 将blob转换为data URL
    const dataUrl = await blobToDataUrl(blob)
    
    // 下载文件
    await downloadFile(dataUrl, filename)
  } catch (error) {
    // 发生错误时，从正在下载列表中移除
    removeFromDownloading(url, filename);
    throw error;
  } finally {
    // 无论成功失败，都从正在下载列表中移除
    removeFromDownloading(url, filename);
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
    const finalZipFilename = `${sanitizedPostTitle}-images.zip`

    // 下载所有图片
    for (let i = 0; i < images.length; i++) {
      const imgUrl = images[i]
      console.log(`正在下载图片 ${i + 1}/${images.length}: ${imgUrl}`)
      
      try {
        const response = await fetch(imgUrl, {
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Accept': 'image/*'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP错误 ${response.status} ${response.statusText}`)
        }
        
        const blob = await response.blob()
        
        // 验证是否为图片类型
        if (!blob.type.startsWith('image/')) {
          throw new Error(`不是有效的图片文件，类型为 ${blob.type}`)
        }
        
        // 获取图片扩展名
        const ext = blob.type.split('/')[1] || 'jpg'
        // 添加到zip
        zip.file(`${sanitizedPostTitle}-${i + 1}.${ext}`, blob)
      } catch (error) {
        console.error(`下载图片 ${imgUrl} 失败:`, error)
        // 继续下载其他图片，不中断整个过程
        zip.file(`${sanitizedPostTitle}-${i + 1}-ERROR.txt`, `下载失败: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  
    // 创建包含所有图片链接的txt文件
    const linksContent = images.map((url, index) => `${index + 1}. ${url}`).join('\n')
    zip.file(`${sanitizedPostTitle}-image-links.txt`, linksContent)
  
    // 生成zip文件
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    
    // 将zip blob转换为data URL
    const dataUrl = await blobToDataUrl(zipBlob)
    
    // 下载zip文件
    await downloadFile(dataUrl, finalZipFilename)
  } catch (error) {
    // 发生错误时，从正在下载列表中移除
    removeFromDownloading(zipIdentifier, zipFilename);
    throw error;
  } finally {
    // 无论成功失败，都从正在下载列表中移除
    removeFromDownloading(zipIdentifier, zipFilename);
  }
}
