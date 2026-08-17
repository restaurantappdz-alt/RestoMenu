/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  base: '/',
  resolve: {
    alias: {
      '@layouts': path.resolve(__dirname, '../shared/layouts'),
      '@svgs': path.resolve(__dirname, '../shared/svgs'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    react(),
    legacy({ targets: ['chrome >= 44', 'safari >= 10'] }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Restaurant Menu Display',
        short_name: 'Menu TV',
        start_url: '.',
        display: 'fullscreen',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /\.(png|svg|jpg|jpeg|webp|gif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tv-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  server: {
    port: 5174,
    strictPort: true,
    allowedHosts: true
  }
})