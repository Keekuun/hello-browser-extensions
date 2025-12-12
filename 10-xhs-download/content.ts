// 检测并处理图片swiper列表

// 定义消息类型接口
interface DownloadMessage {
  url?: string;
  filename?: string;
  images?: string[];
  postTitle?: string;
}

class XhsDownload {
  private downloadButton: HTMLButtonElement | null = null
  private toastContainer: HTMLDivElement | null = null
  private observer: MutationObserver | null = null
  private contextMenuAdded: boolean = false

  constructor() {
    this.init()
    // 监听页面卸载事件，清理资源
    window.addEventListener('beforeunload', () => this.cleanup())
  }

  private init() {
    // 监听页面加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupObserver())
    } else {
      this.setupObserver()
    }

    // 监听右键菜单
    this.setupContextMenu()
  }

  // 清理资源，防止内存泄漏
  private cleanup() {
    // 断开MutationObserver
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }

    // 移除右键菜单事件监听
    document.removeEventListener('contextmenu', this.handleContextMenu)

    // 移除下载按钮
    if (this.downloadButton && this.downloadButton.parentElement) {
      this.downloadButton.parentElement.removeChild(this.downloadButton)
      this.downloadButton = null
    }

    // 移除toast容器
    if (this.toastContainer && this.toastContainer.parentElement) {
      this.toastContainer.parentElement.removeChild(this.toastContainer)
      this.toastContainer = null
    }
  }

  // 设置DOM观察者，检测swiper列表的出现
  private setupObserver() {
    // 避免重复创建观察者
    if (this.observer) {
      return
    }

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          this.detectSwiperList()
        }
      })
    })

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  // 检测swiper列表并添加下载按钮
  private detectSwiperList() {
    const swiperContainer = document.querySelector(
      '.swiper.note-slider'
    ) as HTMLElement

    // 检查按钮是否仍然在DOM中
    if (this.downloadButton && !document.body.contains(this.downloadButton)) {
      this.downloadButton = null
    }

    if (swiperContainer && !this.downloadButton) {
      this.createDownloadButton(swiperContainer)
    }
  }

  // 创建toast提示容器
  private createToastContainer() {
    if (this.toastContainer) {
      return
    }
    
    this.toastContainer = document.createElement('div')
    this.toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `
    
    document.body.appendChild(this.toastContainer)
  }
  
  // 显示toast提示
  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.createToastContainer()
    
    const toast = document.createElement('div')
    toast.style.cssText = `
      background-color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      font-size: 14px;
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateY(-10px);
    `
    toast.textContent = message
    
    this.toastContainer?.appendChild(toast)
    
    // 显示动画
    setTimeout(() => {
      toast.style.opacity = '1'
      toast.style.transform = 'translateY(0)'
    }, 10)
    
    // 2秒后自动隐藏
    setTimeout(() => {
      toast.style.opacity = '0'
      toast.style.transform = 'translateY(-10px)'
      
      setTimeout(() => {
        toast.remove()
      }, 300)
    }, 2000)
  }
  
  // 创建下载按钮
  private createDownloadButton(container: HTMLElement) {
    this.downloadButton = document.createElement('button')
    this.downloadButton.textContent = '✨下载图片'
    this.downloadButton.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      background: #000;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      z-index: 9999;
      font-size: 14px;
      opacity: 0.8;
      transition: opacity 0.2s;
    `

    this.downloadButton.addEventListener('mouseenter', () => {
      this.downloadButton!.style.opacity = '1'
    })

    this.downloadButton.addEventListener('mouseleave', () => {
      this.downloadButton!.style.opacity = '0.8'
    })

    this.downloadButton.addEventListener('click', () => {
      // 添加toast提示
      this.showToast('正在准备下载...', 'info')
      this.downloadAllImages()
    })

    // 添加到swiper容器
    container.style.position = 'relative'
    container.appendChild(this.downloadButton)
  }

  // 获取帖子标题
  private getPostTitle(): string {
    // 尝试多种选择器获取标题，适应不同页面结构
    let titleElement: HTMLElement | null = null
    
    // 合并多个标题选择器，一次性尝试获取
    titleElement = document.querySelector('#detail-title')
    
    // 获取标题文本，如果没有标题则尝试获取正文内容
    let extractedTitle = ''
    if (titleElement) {
      extractedTitle = titleElement.textContent?.trim() || ''
    } else {
      // 尝试获取正文内容作为备选
      const contentElement = document.querySelector('#detail-desc')
      if (contentElement) {
        // 只使用正文前20个字符作为标题
        extractedTitle = contentElement.textContent?.trim().substring(0, 20) || ''
      }
    }
    
    // 清理标题，去除Chrome不允许的特殊字符
    let sanitizedTitle = extractedTitle
      // 移除Chrome downloads API不允许的特殊字符：\ / : * ? " < > |
      .replace(/[\\/:*?"<>|]/g, '_')
      // 移除多余的下划线
      .replace(/_+/g, '_')
      // 限制长度，避免过长文件名
      .substring(0, 20)
      // 去除首尾空白
      .trim()
    
    // 如果标题为空，使用默认值
    return sanitizedTitle || 'xhs-post'
  }

  // 获取图片扩展名（正确处理URL中的查询参数）
  private getImageExtension(url: string): string {
    let ext = 'jpg'
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      ext = pathname.split('.').pop()?.split('?')[0] || 'jpg'
    } catch (e) {
      // 如果URL解析失败，回退到简单方法
      ext = url.split('.').pop()?.split('?')[0] || 'jpg'
    }
    // 限制扩展名长度，防止恶意URL
    return ext.slice(0, 5)
  }

  // 发送消息到background并处理响应
  private sendMessageToBackground(action: string, data: DownloadMessage): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action,
        ...data
      }, (response) => {
        if (response) {
          resolve(response)
        } else {
          console.error('下载请求发送失败: 未收到响应')
          resolve({ success: false, error: '未收到响应' })
        }
      })
    })
  }

  // 生成单张图片的文件名
  private generateSingleImageFilename(postTitle: string, imgUrl: string): string {
    const ext = this.getImageExtension(imgUrl)
    return `${postTitle}.${ext}`
  }

  // 下载所有图片
  private async downloadAllImages() {
    const images = this.getAllImagesFromSwiper()
    if (images.length === 0) {
      this.showToast('没有找到图片', 'error')
      return
    }

    const postTitle = this.getPostTitle()
    
    console.log('postTitle', postTitle)

    try {
      // 如果只有一张图片，直接下载
      if (images.length === 1) {
        const imgUrl = images[0]
        const filename = this.generateSingleImageFilename(postTitle, imgUrl)
        
        // 发送消息到background进行下载
        const response = await this.sendMessageToBackground('downloadImage', {
          url: imgUrl,
          filename: filename
        })

        if (response.success) {
          this.showToast('图片下载请求已发送', 'success')
        } else {
          console.error('下载请求发送失败:', response.error)
          if (response.error?.includes('正在下载')) {
            this.showToast('该图片正在下载中', 'info')
          } else {
            this.showToast('下载请求发送失败', 'error')
          }
        }
      } else {
        // 多张图片，使用zip打包下载
        console.log(`找到 ${images.length} 张图片，正在发送到后台打包下载...`)
        
        // 发送消息到background进行下载
        const response = await this.sendMessageToBackground('downloadImages', {
          images: images,
          postTitle: postTitle
        })

        if (response.success) {
          this.showToast('图片下载请求已发送', 'success')
        } else {
          console.error('下载请求发送失败:', response.error)
          if (response.error?.includes('正在下载')) {
            this.showToast('该图片集正在下载中', 'info')
          } else {
            this.showToast('下载请求发送失败', 'error')
          }
        }
      }
    } catch (error) {
      console.error('下载失败:', error)
      this.showToast('下载失败，请查看控制台', 'error')
    }
  }

  // 获取swiper中的所有图片
  private getAllImagesFromSwiper(): string[] {
    const images: string[] = []
    const swiperSlides = document.querySelectorAll<HTMLImageElement>('.swiper-slide img')
    
    swiperSlides.forEach((img) => {
      let src = img.src || img.getAttribute('data-src') || img.getAttribute('data-original')
      if (src) {
        // 去除水印处理
        src = this.removeWatermark(src)
        images.push(src)
      }
    })
    
    return [...new Set(images)] // 去重
  }

  // 去除图片水印
  private removeWatermark(url: string): string {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      
      // 找到 "!" 的位置并截取
      const exclamationIndex = path.indexOf("!");
      if (exclamationIndex !== -1) {
        const newPath = path.substring(0, exclamationIndex);
        
        // 提取从第三个 "/" 开始的部分
        const pathParts = newPath.split("/");
        if (pathParts.length > 3) {
          const imageName = pathParts.slice(3).join("/");
          
          // 构建新的 URL
          return `https://sns-img-bd.xhscdn.com/${imageName}`;
        }
      }
      
      // 如果处理失败，返回原始 URL
      return url;
    } catch (error) {
      // 如果 URL 解析失败，返回原始 URL
      console.error("URL parsing error in removeWatermark:", error);
      return url;
    }
  }

  // 下载单张图片
  private async downloadImage(url: string, filename: string) {
    this.showToast('正在准备下载...', 'info')
    try {
      // 去除水印
      const noWatermarkUrl = this.removeWatermark(url)
      
      // 发送消息到background进行下载
      const response = await this.sendMessageToBackground('downloadImage', {
        url: noWatermarkUrl,
        filename: filename
      })

      if (response.success) {
        this.showToast('图片下载请求已发送', 'success')
      } else {
        console.error('下载请求发送失败:', response.error)
        if (response.error?.includes('正在下载')) {
          this.showToast('该图片正在下载中', 'info')
        } else {
          this.showToast('下载请求发送失败', 'error')
        }
      }
    } catch (error) {
      console.error('下载图片失败:', error)
      this.showToast('下载请求发送失败', 'error')
    }
  }

  // 设置右键菜单
  private setupContextMenu() {
    // 避免重复添加事件监听
    if (this.contextMenuAdded) {
      return
    }

    // 使用箭头函数绑定this，确保在handleContextMenu中this指向正确
    this.handleContextMenu = (e) => {
      // 检查是否点击了图片
      const target = e.target as HTMLElement
      if (target.tagName === 'IMG') {
        // 延迟执行，确保浏览器默认菜单已创建
        setTimeout(() => this.modifyContextMenu(), 50)
      }
    }

    document.addEventListener('contextmenu', this.handleContextMenu)
    this.contextMenuAdded = true
  }

  // 右键菜单事件处理函数
  private handleContextMenu: ((e: MouseEvent) => void) | null = null

  // 修改右键菜单，添加下载按钮
  private modifyContextMenu() {
    const contextMenu = document.querySelector<HTMLElement>('.context-menu-container')
    if (!contextMenu) return

    // 检查是否已经添加了下载按钮
    if (contextMenu.querySelector('.xhs-download-menu-item')) {
      return
    }

    // 创建自定义下载按钮
    const menuItem = document.createElement('div')
    menuItem.className = 'menu-item xhs-download-menu-item'
    menuItem.innerHTML = '✨下载图片'
    menuItem.style.cssText = `
      font-size: 16px;
      height: 40px;
      padding: 0px 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
    `

    // 添加鼠标事件
    menuItem.addEventListener('mouseenter', () => {
      menuItem.style.backgroundColor = 'rgba(0, 0, 0, 0.03)'
    })

    menuItem.addEventListener('mouseleave', () => {
      menuItem.style.backgroundColor = 'transparent'
    })

    // 添加点击事件
    menuItem.addEventListener('click', () => {
      const activeImg = document.querySelector<HTMLImageElement>('.swiper-slide-active img')
      if (activeImg) {
        const src = activeImg.src || activeImg.getAttribute('data-src') || activeImg.getAttribute('data-original')
          if (src) {
            const postTitle = this.getPostTitle()
            console.log('postTitle', postTitle)
            // 使用生成的文件名进行下载
            const filename = this.generateSingleImageFilename(postTitle, src)
            this.downloadImage(src, filename)
          }
      }
      // 关闭右键菜单 - 使用更合适的方式，不直接删除容器
      // 通常网站会添加隐藏类或修改style来关闭菜单，而不是删除
      if (contextMenu) {
        // 尝试添加隐藏类（根据小红书的实际实现）
        contextMenu.style.display = 'none'
        // 或者模拟点击页面其他地方关闭菜单
        document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      }
    })

    // 将按钮插入到菜单最前面
    const firstMenuItem = contextMenu.querySelector('.menu-item')
    if (firstMenuItem) {
      contextMenu.insertBefore(menuItem, firstMenuItem)
    } else {
      contextMenu.appendChild(menuItem)
    }
  }
}

// 初始化扩展
new XhsDownload()
