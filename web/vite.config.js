import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Espone automaticamente su rete locale (0.0.0.0) per smartphone
    port: 5173
  }
})
