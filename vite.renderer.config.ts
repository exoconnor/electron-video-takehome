import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    modules: {
      // Enable CSS modules for all CSS files that end with .module.css
      localsConvention: 'camelCase',
      scopeBehaviour: 'local',
      // Generate a more readable class name in development
      generateScopedName:
        process.env.NODE_ENV === 'development'
          ? '[name]__[local]__[hash:base64:5]'
          : '[hash:base64:8]',
    },
  },
})
