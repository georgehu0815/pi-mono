import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5174, // Different port from Lit version (5173)
  },
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
