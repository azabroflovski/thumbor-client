import { defineConfig } from 'vite'

export default defineConfig({
  // relative paths: served at /playground/ next to the docs, and from any path in dev
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
