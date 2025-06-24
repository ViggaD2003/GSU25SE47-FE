import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
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
      '@constants': fileURLToPath(new URL('./src/constants', import.meta.url)),
      '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@store': fileURLToPath(new URL('./src/store', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
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
})
