import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Базовый путь для GitHub Pages: соответствует имени репозитория
  base: process.env.NODE_ENV === 'production' ? '/izzy-atcs/' : '/',
})
