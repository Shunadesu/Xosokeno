import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      // Backend API proxy - handle all /api calls
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('API proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to API:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from API:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  // Ẩn source maps trong production để bảo mật
  build: {
    sourcemap: false,
    outDir: 'dist',
    rollupOptions: {
      output: {
        // Ẩn tên file để khó debug hơn
        entryFileNames: 'assets/[hash].js',
        chunkFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]'
      }
    }
  },
  // Ẩn các thông tin debug trong console
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
})
