import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr';
import * as path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss(), svgr()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  preview: {
    port: 5173,
    allowedHosts: ['localhost:5173', 'nas.local', 'localhost:3001'],
    proxy: {
      '/api': 'http://games-browser-backend:3001',
    },
  },
  server: {
    allowedHosts: ['nas.local', 'localhost:3001'],
    proxy: {
      '/api': 'http://games-browser-backend:3001',
    },
  },
})
