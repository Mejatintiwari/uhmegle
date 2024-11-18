import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Set the port to 5173
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
