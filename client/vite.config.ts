import { defineConfig } from 'vite'
import { fileURLToPath, URL } from "url";
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 4200
  },
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      { find: 'readable-stream', replacement: "vite-compatible-readable-stream" },
    ]
  }
})
