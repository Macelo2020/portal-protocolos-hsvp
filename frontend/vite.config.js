import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/portal/',  // <--- ADICIONA ISTO (Define a pasta no XAMPP)
  server: {
    host: true,
    port: 5173,
  }
})