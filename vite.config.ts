import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Adicionar SSL básico para desenvolvimento quando necessário
    ...(process.env.HTTPS === 'true' ? [basicSsl()] : [])
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    https: process.env.HTTPS === 'true',
    host: true,
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', 'tailwind-merge', 'clsx'],
          maps: ['leaflet', 'react-leaflet'],
          charts: ['recharts'],
          stripe: ['@stripe/stripe-js', 'stripe'],
        },
      },
    },
  },
})