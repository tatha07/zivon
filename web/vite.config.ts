import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handleGnaniApi } from './server/gnaniHandler'

function gnaniApiPlugin(): Plugin {
  return {
    name: 'gnani-api-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        handleGnaniApi(req, res, next)
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        handleGnaniApi(req, res, next)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), gnaniApiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
})
