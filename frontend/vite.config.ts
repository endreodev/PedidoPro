import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    // Permite acesso via host.docker.internal (execução em container Docker).
    allowedHosts: ['localhost', 'host.docker.internal', '127.0.0.1'],
    proxy: {
      // Encaminha /api/* ao backend Laravel (mesma rede docker). Sem rewrite:
      // o backend já expõe as rotas sob /api/v1.
      '/api': {
        target: 'http://pedidospro-backend:8000',
        changeOrigin: true,
      },
    },
  },
})
