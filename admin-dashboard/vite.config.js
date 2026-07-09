import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const projectDir = path.resolve(__dirname)

export default defineConfig({
  root: projectDir,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(projectDir, 'src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    host: true,
  },
})
