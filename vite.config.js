import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  plugins: [
    vue(),
    AutoImport({
      resolvers: [
        // Auto import icons
        IconsResolver({
          prefix: 'Icon',
        }),
      ],
    }),
    Icons({
      autoInstall: true,
      compiler: 'vue3',
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler' // 使用现代编译器API，避免legacy JS API警告
      }
    }
  },
  server: {
    port: 5000,
    proxy: {
      '/api': {
        target: "http://localhost:57070",
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '')
        },
      // '/llm': {
      //   target: "http://localhost:58070",
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/llm/, '')
      // },
      // '/resources':{
      //   target: "http://localhost:58012",
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/resources/, '')
      // },
      // '/blogs':{
      //   target: "http://localhost:58050",
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/blogs/, '')
      // },
    }
  }
})
