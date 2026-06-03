import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [tailwindcss(), react()],
    resolve: {
      // Ensure a single React instance across linked workspace packages
      // (@livedrop/realtime, @livedrop/features) to avoid "invalid hook call".
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
