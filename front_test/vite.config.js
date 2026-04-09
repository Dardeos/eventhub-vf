import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Look closely at the spelling!

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
