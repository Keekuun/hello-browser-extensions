// 检测并处理图片swiper列表

class XhsDownload {
  private downloadButton: HTMLButtonElement | null = null
  private toastContainer: HTMLDivElement | null = null

  constructor() {
    this.init()
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

  // 设置DOM观察者，检测swiper列表的出现
  private setupObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          this.detectSwiperList()
        }
      })
    })

    observer.observe(document.body, {
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
      this.downloadAllImages()
    })

    // 添加到swiper容器
    container.style.position = 'relative'
    container.appendChild(this.downloadButton)
  }

  // 获取帖子标题
  private getPostTitle(): string {
    const titleElement = document.querySelector('#detail-title')
    if (titleElement) {
      // 清理标题，去除Chrome不允许的特殊字符
      let title = titleElement.textContent?.trim() || ''
      // 移除Chrome downloads API不允许的特殊字符：\ / : * ? " < > |
      title = title.replace(/[\\/:*?"<>|]/g, '_')
      // 移除多余的下划线
      title = title.replace(/_+/g, '_')
      // 限制长度，避免过长文件名
      if (title.length > 50) {
        title = title.substring(0, 50)
      }
      // 如果标题为空，使用默认值
      return title || 'xhs-post'
    }
    return 'xhs-post'
  }

  // 下载所有图片
  private async downloadAllImages() {
    const images = this.getAllImagesFromSwiper()
    if (images.length === 0) {
      alert('没有找到图片')
      return
    }

    const postTitle = this.getPostTitle()
    
    try {
      // 如果只有一张图片，直接下载
      if (images.length === 1) {
        const imgUrl = images[0]
        // 获取图片扩展名（正确处理URL中的查询参数）
        let ext = 'jpg'
        try {
          const urlObj = new URL(imgUrl)
          const pathname = urlObj.pathname
          ext = pathname.split('.').pop()?.split('?')[0] || 'jpg'
        } catch (e) {
          // 如果URL解析失败，回退到简单方法
          ext = imgUrl.split('.').pop()?.split('?')[0] || 'jpg'
        }
        // 限制扩展名长度，防止恶意URL
        ext = ext.slice(0, 5)
        const filename = `${postTitle}.${ext}`
        
        // 发送消息到background进行下载
        chrome.runtime.sendMessage({
          action: 'downloadImage',
          url: imgUrl,
          filename: filename
        }, (response) => {
          if (response.success) {
            this.showToast('图片下载请求已发送', 'success')
          } else {
            console.error('下载请求发送失败:', response.error)
            if (response.error.includes('正在下载')) {
              this.showToast('该图片正在下载中', 'info')
            } else {
              this.showToast('下载请求发送失败', 'error')
            }
          }
        })
      } else {
        // 多张图片，使用zip打包下载
        console.log(`找到 ${images.length} 张图片，正在发送到后台打包下载...`)
        
        // 发送消息到background进行下载
        chrome.runtime.sendMessage({
          action: 'downloadImages',
          images: images,
          postTitle: postTitle
        }, (response) => {
          if (response.success) {
            this.showToast('图片下载请求已发送', 'success')
          } else {
            console.error('下载请求发送失败:', response.error)
            if (response.error.includes('正在下载')) {
              this.showToast('该图片集正在下载中', 'info')
            } else {
              this.showToast('下载请求发送失败', 'error')
            }
          }
        })
      }
    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败，请查看控制台')
    }
  }

  // 获取swiper中的所有图片
  private getAllImagesFromSwiper(): string[] {
    const images = []
    const swiperSlides = document.querySelectorAll('.swiper-slide img')
    
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
    let result = url
    
    // 小红书图片去水印处理
    // 1. 处理包含watermark的URL
    if (result.includes('watermark')) {
      // 移除watermark相关参数
      result = result.replace(/\?watermark.*$/, '')
    }
    
    // 2. 处理包含wm参数的URL
    if (result.includes('wm=')) {
      result = result.replace(/wm=[^&]+&?/, '')
      // 移除末尾的&符号
      if (result.endsWith('&')) {
        result = result.slice(0, -1)
      }
    }
    
    // 3. 处理缩略图URL，转换为原图
    // 常见的缩略图标记：_180x180、_360x360、_720x720等
    result = result.replace(/_\d+x\d+(\.\w+)$/, '$1')
    
    // 4. 处理包含quality参数的URL，提高图片质量
    if (result.includes('quality=')) {
      result = result.replace(/quality=\d+/, 'quality=100')
    }
    
    return result
  }

  // 下载单张图片
  private downloadImage(url: string, filename: string) {
    try {
      // 去除水印
      const noWatermarkUrl = this.removeWatermark(url)
      
      // 发送消息到background进行下载
    chrome.runtime.sendMessage({
      action: 'downloadImage',
      url: noWatermarkUrl,
      filename: filename
    }, (response) => {
      if (response.success) {
        this.showToast('图片下载请求已发送', 'success')
      } else {
        console.error('下载请求发送失败:', response.error)
        if (response.error.includes('正在下载')) {
          this.showToast('该图片正在下载中', 'info')
        } else {
          this.showToast('下载请求发送失败', 'error')
        }
      }
    })
    } catch (error) {
      console.error('下载图片失败:', error)
      throw error
    }
  }

  // 设置右键菜单
  private setupContextMenu() {
    document.addEventListener('contextmenu', (e) => {
      // 检查是否点击了图片
      const target = e.target as HTMLElement
      if (target.tagName === 'IMG') {
        // 延迟执行，确保浏览器默认菜单已创建
        setTimeout(() => this.modifyContextMenu(), 10)
      }
    })
  }

  // 修改右键菜单，添加下载按钮
  private modifyContextMenu() {
    const contextMenu = document.querySelector('.context-menu-container')
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
      const activeImg = document.querySelector('.swiper-slide-active img')
      if (activeImg) {
        const src = activeImg.src || activeImg.getAttribute('data-src') || activeImg.getAttribute('data-original')
          if (src) {
            // 获取图片扩展名（正确处理URL中的查询参数）
            let ext = 'jpg'
            try {
              const urlObj = new URL(src)
              const pathname = urlObj.pathname
              ext = pathname.split('.').pop()?.split('?')[0] || 'jpg'
            } catch (e) {
              // 如果URL解析失败，回退到简单方法
              ext = src.split('.').pop()?.split('?')[0] || 'jpg'
            }
            // 限制扩展名长度，防止恶意URL
            ext = ext.slice(0, 5)
            const postTitle = this.getPostTitle()
            const filename = `${postTitle}-active.${ext}`
            this.downloadImage(src, filename)
          }
      }
      // 关闭右键菜单
      contextMenu.remove()
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
