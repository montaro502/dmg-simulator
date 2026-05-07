import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/dmg-simulator/',
  build: {
    outDir: 'docs',
    sourcemap: false,
  },
})