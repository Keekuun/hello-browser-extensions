import { defineConfig } from 'wxt';

export default defineConfig({
  manifestVersion: 3,
  manifest: {
    name: 'QLabel 助手',
    description: '提取QLabel页面的指令和图片并处理',
    version: '1.0',
    permissions: ['activeTab', 'storage'],
    host_permissions: ['https://qlabel.tencent.com/workbench/tasks/*', "http://localhost:63342/*"],
    icons: {
      16: '/icon.png',
      24: '/icon.png',
      48: '/icon.png',
      96: '/icon.png',
      128: '/icon.png',
    },
  }
});
