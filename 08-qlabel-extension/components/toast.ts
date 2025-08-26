export type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
}

export function showToast(
  message: string,
  type: ToastType = 'info',
  options: ToastOptions = {}
): void {
  // 先删除之前的 toast
  const existingToast = document.querySelectorAll('.toast-container');
  existingToast.forEach(toast => toast.parentNode?.removeChild(toast));

  const { duration = 3000, position = 'top-right' } = options;

  // 创建 toast 容器
  const toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  toastContainer.style.cssText = `
    position: fixed;
    z-index: 9999;
    padding: 16px;
    margin: 12px;
    border-radius: 4px;
    color: white;
    font-weight: 500;
    font-size: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    gap: 8px;
    pointer-events: none;
    transition: all 0.3s ease;
    min-width: 200px;
    max-width: 300px;
  `;

  // 设置位置
  switch (position) {
    case 'top-right':
      toastContainer.style.top = '0';
      toastContainer.style.right = '0';
      break;
    case 'top-left':
      toastContainer.style.top = '0';
      toastContainer.style.left = '0';
      break;
    case 'bottom-right':
      toastContainer.style.bottom = '0';
      toastContainer.style.right = '0';
      break;
    case 'bottom-left':
      toastContainer.style.bottom = '0';
      toastContainer.style.left = '0';
      break;
    case 'center':
      toastContainer.style.top = '50%';
      toastContainer.style.left = '50%';
      toastContainer.style.transform = 'translate(-50%, -50%)';
      break;
  }

  // 设置不同类型的颜色和图标
  let backgroundColor = '';
  let textColor = '';
  let icon = '';

  switch (type) {
    case 'success':
      backgroundColor = '#10b981'; // green-500
      textColor = '#10b981'; // green-500
      icon = '✅';
      break;
    case 'error':
      backgroundColor = '#ef4444'; // red-500
      textColor = '#ef4444'; // red-500
      icon = '❌';
      break;
    case 'info':
      backgroundColor = '#3b82f6'; // blue-500
      textColor = '#3b82f6'; // blue-500
      icon = 'ⓘ';
      break;
  }

  // toastContainer.style.backgroundColor = backgroundColor;
  toastContainer.style.color = textColor;

  // 添加图标
  const iconElement = document.createElement('span');
  iconElement.textContent = icon;
  iconElement.style.fontSize = '18px';

  // 添加消息文本
  const textElement = document.createElement('span');
  textElement.textContent = message;
  textElement.style.flex = '1';
  textElement.style.wordBreak = 'break-word';

  // 组装 toast
  toastContainer.appendChild(iconElement);
  toastContainer.appendChild(textElement);

  // 添加到页面
  document.body.appendChild(toastContainer);

  // 添加显示动画
  setTimeout(() => {
    toastContainer.style.opacity = '1';
    toastContainer.style.transform = position.includes('top') 
      ? 'translateY(0)' 
      : position.includes('bottom') 
        ? 'translateY(0)' 
        : toastContainer.style.transform;
  }, 10);

  // 自动移除
  setTimeout(() => {
    toastContainer.style.opacity = '0';
    toastContainer.style.transform = position.includes('top') 
      ? 'translateY(-100%)'
      : position.includes('bottom')
        ? 'translateY(100%)'
        : toastContainer.style.transform;
    
    // 动画结束后移除元素
    setTimeout(() => {
      if (toastContainer.parentNode) {
        toastContainer.parentNode.removeChild(toastContainer);
      }
    }, 300);
  }, duration);
}