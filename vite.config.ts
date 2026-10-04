import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the build works under any path, including GitHub Pages' /<repo>/.
export default defineConfig({
  base: './',
  plugins: [react()],
})
