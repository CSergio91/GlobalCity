import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api-kucoin': {
          target: 'https://api.kucoin.com',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api-kucoin/, '')
        },
        '/api-binance': {
          target: 'https://api.binance.com',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api-binance/, '')
        },
        '/api-bybit': {
          target: 'https://api.bybit.com',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api-bybit/, '')
        },
        '/api-okx': {
          target: 'https://www.okx.com',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api-okx/, '')
        }
      }
    },
  };
});
