import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    host: true,
    https: false,
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
        'test-performance': resolve(__dirname, 'test-performance.html'),
        // Service pages
        'services/cloud-solutions': resolve(__dirname, 'services/cloud-solutions.html'),
        'services/cybersecurity': resolve(__dirname, 'services/cybersecurity.html'),
        'services/data-recovery': resolve(__dirname, 'services/data-recovery.html'),
        'services/digital-transformation': resolve(__dirname, 'services/digital-transformation.html'),
        'services/hardware-solutions': resolve(__dirname, 'services/hardware-solutions.html'),
        'services/it-support': resolve(__dirname, 'services/it-support.html'),
        'services/network-infrastructure': resolve(__dirname, 'services/network-infrastructure.html'),
        'services/network-solutions': resolve(__dirname, 'services/network-solutions.html'),
        'services/software-development': resolve(__dirname, 'services/software-development.html'),
        'services/web-app-dev': resolve(__dirname, 'services/web-app-dev.html'),
        'services/wifi-starlink': resolve(__dirname, 'services/wifi-starlink.html'),
      },
      output: {
        manualChunks: {
          utils: ['src/js/utils/image-loader.js'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
  },
  css: {
    devSourcemap: true,
  },
  assetsInclude: [
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.svg',
    '**/*.webp',
    '**/*.avif'
  ],
  optimizeDeps: {
    include: [],
  },
  esbuild: {
    target: 'es2020',
  },
});
