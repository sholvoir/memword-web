import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '',
  build: {
    target: 'esnext',
    outDir: '../sholvoir.github.io/memword',
    assetsDir: '',
    rollupOptions: {
      input: 'lib/worker.ts',
      output: {
        entryFileNames: '[name].js'
      }
    }
  }
})
