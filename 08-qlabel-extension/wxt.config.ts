import { defineConfig } from 'wxt';
import { config } from 'dotenv'

// Load environment variables
config()

// Log warning if using default values
if (!process.env.VITE_QLABEL_COMMAND_ID) {
  console.warn('⚠️  VITE_QLABEL_COMMAND_ID not set')
}
if (!process.env.VITE_QLABEL_SHORTCUT) {
  console.warn('⚠️  VITE_QLABEL_SHORTCUT not set')
}

export default defineConfig({
  manifestVersion: 3,
  manifest: {
    name: 'QLabel 助手',
    description: '提取QLabel页面的指令和图片并处理',
    version: '1.0',
    permissions: ['activeTab', 'storage'],
    host_permissions: ['https://qlabel.tencent.com/workbench/tasks/*', "http://localhost:63342/*"],
    commands: {
      [process.env.VITE_QLABEL_COMMAND_ID!]: {
        suggested_key: {
          default: process.env.VITE_QLABEL_SHORTCUT
        },
        description: '打开QLabel助手'
      }
    },
  },
  modules: ['@wxt-dev/auto-icons'],
  autoIcons: {
    developmentIndicator: 'overlay'
  }
});
