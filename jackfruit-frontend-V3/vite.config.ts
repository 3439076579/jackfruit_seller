import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { mockApiPlugin } from './mock'

/**
 * 两种运行模式，由 .env.development 里的 VITE_USE_MOCK 切换：
 *
 *   VITE_USE_MOCK=true   走内存 Mock，不需要后端和数据库（默认）
 *   VITE_USE_MOCK=false  走 Vite 代理转发到 Go 后端 localhost:8082
 *
 * 两者不能同时生效：开了 mock 就不注册 proxy，否则 proxy 会先截走 /api 请求。
 *
 * 后端路由全部挂在根路径下（/user、/order、/jackfruit…），没有统一前缀，
 * 所以前端加 /api 只为自身可读，转发时必须 rewrite 掉。
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const useMock = env.VITE_USE_MOCK === 'true'

  const backendProxy = {
    '/api': {
      target: 'http://localhost:8082',
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, ''),
    },
  }

  return {
    plugins: [vue(), ...(useMock ? [mockApiPlugin()] : [])],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: useMock ? {} : backendProxy,
    },
    build: {
      // Element Plus 全量引入约 950KB，已单独切块；
      // 若日后想进一步压体积，改成 unplugin-vue-components 按需引入即可。
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks: {
            'element-plus': ['element-plus'],
            vendor: ['vue', 'vue-router', 'pinia', 'axios'],
          },
        },
      },
    },
  }
})
