import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@game': path.resolve(__dirname, './src/game'),
      '@assets': path.resolve(__dirname, './public/assets'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    assetsInlineLimit: 0, // Ensure game assets are not inlined as base64
  },
});
