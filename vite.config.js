import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { pocCeMockApiPlugin } from './mockPocApi.js'

export default defineConfig({
  plugins: [react(), tailwindcss(), pocCeMockApiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true
  }
})

