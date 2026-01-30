import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'crypto-vendor': ['ethers', 'bitcoinjs-lib', 'bip32', 'bip39', 'tweetnacl', '@noble/hashes', '@noble/secp256k1', '@noble/ed25519'],
          'ui-vendor': ['lucide-react', 'qrcode.react', 'tailwindcss'],
        },
      },
    },
  },
  worker: {
    format: 'es',
  },
})
