import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '',
  plugins: [solid(), tailwindcss()],
  build: {
    target: 'esnext',
    outDir: '../sholvoir.github.io/memword',
    emptyOutDir: true,
    assetsDir: '',
    rollupOptions: {
      input: ['/index.html', '/admin.html']
    }
  }
})
