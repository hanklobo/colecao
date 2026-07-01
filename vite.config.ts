import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // The default Workbox navigation fallback sends EVERY unmatched
        // navigation to the cached index.html — including sitemap.xml and
        // robots.txt, which crawlers/tools fetch as a top-level navigation.
        // Exclude those (and api/) so they always hit the network/server.
        navigateFallbackDenylist: [/^\/api\//, /^\/sitemap\.xml$/, /^\/robots\.txt$/],
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
