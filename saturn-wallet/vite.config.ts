import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from "vite-plugin-wasm"; // Якщо ви використовуєте цей плагін
import topLevelAwait from "vite-plugin-top-level-await"; // І цей

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait()
  ],
  server: {
    fs: {
      allow: [
        '.', 
        'D:/saturn-service', 
      ],
    },
  },
})