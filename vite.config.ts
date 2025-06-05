import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@types': path.resolve(__dirname, './src/types'),
      '@components': path.resolve(__dirname, './src/components'),
    },
  },
  server: {
    host: '0.0.0.0', // Allow connections from outside the container
    port: 3000,
    strictPort: true, // Fail if port is in use
    allowedHosts: ['builder.7thseraph.org'], // Remove the api subdomain
    proxy: {
      '/graphql': {
        target: process.env.NODE_ENV === 'production'
          ? 'http://builderserver:5501'
          : 'http://localhost:5501',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
