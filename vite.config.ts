import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import UnoCSS from 'unocss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact(), UnoCSS()]
})
//
// , VitePWA({
//     registerType: 'autoUpdate',
//     injectRegister: null,
//     workbox: {
//       clientsClaim: true,
//       skipWaiting: true
//     }
//   })