import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Increase chunk size warning threshold (in KB)
    chunkSizeWarningLimit: 1500,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Put all node_modules code into a separate chunk named 'vendor'
            return 'vendor'
          }
          // Add more manual chunking logic if needed for your application
        }
      }
    }
  }
})
