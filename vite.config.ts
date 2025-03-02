import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import UnoCSS from 'unocss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '',
  plugins: [preact(), UnoCSS()],
  build: {
    target: 'esnext',
    outDir: '../sholvoir.github.io/memword',
    emptyOutDir: true,
    assetsDir: '',
    copyPublicDir: false
  }
})
