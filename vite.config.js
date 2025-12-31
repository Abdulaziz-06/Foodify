
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/cgi': {
        target: 'https://world.openfoodfacts.org',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('User-Agent', 'Foodify - WebApp - Version 1.0 - www.foodify.com');
          });
        }
      },
      '/api': {
        target: 'https://world.openfoodfacts.org',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('User-Agent', 'Foodify - WebApp - Version 1.0 - www.foodify.com');
          });
        }
      },
      '/category': {
        target: 'https://world.openfoodfacts.org',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('User-Agent', 'Foodify - WebApp - Version 1.0 - www.foodify.com');
          });
        }
      },
      '/categories.json': {
        target: 'https://world.openfoodfacts.org',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('User-Agent', 'Foodify - WebApp - Version 1.0 - www.foodify.com');
          });
        }
      }
    }
  }
})
