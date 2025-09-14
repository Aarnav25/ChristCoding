import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Make environment variables available to the client
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  server: {
    port: parseInt(process.env.VITE_PORT || '5173'),
    host: process.env.VITE_HOST || 'localhost',
  },
})
