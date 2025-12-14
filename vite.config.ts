import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-htaccess',
      closeBundle() {
        copyFileSync(
          resolve(__dirname, '.htaccess'),
          resolve(__dirname, 'dist', '.htaccess')
        )
      }
    }
  ],
  server: {
    port: 8080,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'form-vendor': ['react-hook-form', 'react-datepicker'],
          'utils': ['date-fns', 'zustand'],
          'dashboard': [
            './src/pages/Dashboard.tsx',
            './src/pages/dashboard/Profile.tsx',
            './src/pages/dashboard/Reservations.tsx',
            './src/pages/dashboard/Settings.tsx'
          ],
          'admin': [
            './src/pages/dashboard/admin/Users.tsx',
            './src/pages/dashboard/admin/Spaces.tsx',
            './src/pages/dashboard/admin/Reservations.tsx'
          ],
          'erp': [
            './src/components/erp/Dashboard.tsx',
            './src/components/erp/AnalyticsAndReporting.tsx'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'date-fns']
  }
})