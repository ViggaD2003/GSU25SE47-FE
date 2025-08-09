import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
import path from 'node:path'

export default defineConfig(({ mode }) => {
  // Load env variables based on mode
  const envDir = path.dirname(fileURLToPath(import.meta.url))
  const env = loadEnv(mode, envDir, '')
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@components': fileURLToPath(
          new URL('./src/components', import.meta.url)
        ),
        '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
        '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
        '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
        '@constants': fileURLToPath(
          new URL('./src/constants', import.meta.url)
        ),
        '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
        '@store': fileURLToPath(new URL('./src/store', import.meta.url)),
        '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      },
    },
    server: {
      port: env.VITE_PORT || 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              // Log outgoing requests
              console.log('Proxying request:', req.method, req.url)
            })
          },
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            react: ['react', 'react-dom'],
            antd: ['antd'],
            redux: ['@reduxjs/toolkit', 'react-redux'],
            i18n: ['react-i18next', 'i18next'],
            router: ['react-router-dom'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    define: {
      global: {},
    },
    esbuild: {
      drop: ['console', 'debugger'],
    },
  }
})
