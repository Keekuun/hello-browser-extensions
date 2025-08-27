import { defineConfig } from 'wxt';

export default defineConfig({
  manifestVersion: 3,
  manifest: {
    name: 'QLabel 助手',
    description: '提取QLabel页面的指令和图片并处理',
    version: '1.0',
    permissions: ['activeTab', 'storage'],
    host_permissions: ['https://qlabel.tencent.com/workbench/tasks/*', "http://localhost:63342/*"],
  },
  modules: ['@wxt-dev/auto-icons'],
  autoIcons: {
    developmentIndicator: 'overlay'
  }
});
