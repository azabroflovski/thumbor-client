import { defineConfig } from 'vite'

export default defineConfig({
  // relative paths so the build works under /thumbor-client/ on GitHub Pages
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
