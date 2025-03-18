import { defineConfig } from 'vite'
import { outDir } from './outdir.ts';
import preact from '@preact/preset-vite'
import UnoCSS from 'unocss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '',
  plugins: [preact(), UnoCSS()],
  build: {
    target: 'esnext',
    outDir,
    emptyOutDir: true,
    assetsDir: ''
  }
})
