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
    host: true, // Permite acesso externo
    port: 5173,
  },
})