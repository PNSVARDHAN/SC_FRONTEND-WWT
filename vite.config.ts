// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'd928e88ca296.ngrok-free.app'  // 👈 add your ngrok host here
    ],
    host: true, // ensure accessible externally
    port: 5173
  }
})
