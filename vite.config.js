import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    Sitemap({
      hostname: 'https://antilabs.in',
      dynamicRoutes: [
        '/',
        '/about',
        '/services',
        '/careers',
        '/contact',
        '/testimonials',
        '/terms',
        '/privacy',
        '/refund',
        '/employment',
        '/login',
        '/register'
      ],
      generateRobotsTxt: false,
    })
  ],
})
