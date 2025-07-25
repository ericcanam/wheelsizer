import { fileURLToPath, URL } from 'node:url'

import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { version } from './package.json'

var cdate = new Date()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  base: './',
  define: {
    APP_VERSION: JSON.stringify("Version "+version),
    BUILD_DATE: JSON.stringify(cdate.getFullYear())
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        calculator: resolve(__dirname, 'calculator.html'),
        error: resolve(__dirname, 'error.html'),
        about: resolve(__dirname, 'about.html'),
        check: resolve(__dirname, 'check.html')
      }
    }
  }
})
