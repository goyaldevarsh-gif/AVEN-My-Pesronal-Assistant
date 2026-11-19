import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png', 'illustrations/*.webp'],
      manifest: {
        name: 'AVEN', short_name: 'AVEN', description: 'Life, thoughtfully organised.',
        start_url: '/', scope: '/', display: 'standalone', orientation: 'portrait',
        theme_color: '#102A43', background_color: '#F6F8FA',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: { navigateFallback: '/index.html', globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'] },
    }),
  ],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
