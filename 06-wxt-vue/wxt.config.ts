import {ConfigEnv, defineConfig} from 'wxt';
import Unocss from 'unocss/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  vite:  (env: ConfigEnv) => ({
    plugins: [
      Unocss(),
      Components({
        resolvers: [
          IconsResolver({
            // icons: https://icones.netlify.app/
            prefix: 'icon', // 自动引入的Icon组件统一前缀，默认为i，设置为icon则为<icon-mdi:account />
            enabledCollections: ['mdi', 'carbon', 'ant-design'] // 指定需要自动引入的图标集
          })
        ]
      }),
      Icons({
        autoInstall: true, // 自动安装图标集
        compiler: 'vue3' // 编译器
      })
    ],
  })
});
