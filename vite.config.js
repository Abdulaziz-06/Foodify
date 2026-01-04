
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy all API paths to Open Food Facts
      // We consolidate them to apply consistent timeout and header settings
      ...['/cgi', '/api', '/category', '/categories.json'].reduce((acc, path) => {
        acc[path] = {
          target: 'https://world.openfoodfacts.org',
          changeOrigin: true,
          secure: false,
          timeout: 60000,      // Timeout for incoming request
          proxyTimeout: 60000, // Timeout for outgoing proxy request to target
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              proxyReq.setHeader('User-Agent', 'Foodify - WebApp - Version 1.0 - www.foodify.com');
              proxyReq.setHeader('Connection', 'keep-alive');
            });
            proxy.on('error', (err, req, res) => {
              console.error(`Proxy Error on ${path}:`, err.message);
            });
          }
        };
        return acc;
      }, {})
    }
  }
})
