import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Custom src/sw.ts (instead of the fully auto-generated service
      // worker) so it can also handle Web Push — 'push'/'notificationclick'
      // aren't something the generateSW strategy lets you hook into.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html}'],
      },
      manifest: {
        name: 'Coleção Copa 2026',
        short_name: 'Copa 2026',
        description: 'Álbum de figurinhas da Copa do Mundo 2026',
        theme_color: '#0b2e6b',
        background_color: '#0b2e6b',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
