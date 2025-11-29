import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5757,
    proxy: {
      '/api': {
        target: 'http://localhost:5858',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});