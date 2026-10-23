/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'Zmajska akademija ugank',
        short_name: 'Zmajska akademija',
        description: 'Zasebna družinska matematična igra za otroke od 6 do 9 let.',
        lang: 'sl',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0f2a2e',
        theme_color: '#0f2a2e',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        // Everything the game needs is precached, so it plays without a connection.
        globPatterns: ['**/*.{js,css,html,svg,png,json,mp3,webmanifest}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      include: ['src/engine/**', 'src/storage/**'],
      exclude: ['**/*.test.ts', '**/index.ts'],
      thresholds: { lines: 90, statements: 90, functions: 90, branches: 85 },
    },
  },
});
