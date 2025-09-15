import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/favicon.ico': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    },
    https: false
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        services: resolve(__dirname, 'services.html'),
        contact: resolve(__dirname, 'contact.html'),
        cart: resolve(__dirname, 'cart.html'),
        help: resolve(__dirname, 'help.html'),
        'tech-lab': resolve(__dirname, 'tech-lab.html'),
        'test-performance': resolve(__dirname, 'test-performance.html')
      },
      output: {
        manualChunks: {
          utils: ['src/js/utils/image-loader.js']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser'
  },
  css: {
    devSourcemap: true
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg', '**/*.webp', '**/*.avif'],
  optimizeDeps: {
    include: []
  },
  esbuild: {
    target: 'es2020'
  }
})
