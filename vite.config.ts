import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { telegramAuthPlugin } from './src/server/telegramAuthPlugin.ts';
import { marketDataGatewayPlugin } from './src/server/marketDataGatewayPlugin.ts';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), telegramAuthPlugin(), marketDataGatewayPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/klinecharts/')) {
              return 'vendor-charts';
            }
            if (id.includes('node_modules/lucide-react/') || id.includes('node_modules/@icons-pack/')) {
              return 'vendor-icons';
            }
            if (id.includes('node_modules/@supabase/')) {
              return 'vendor-supabase';
            }
            if (id.includes('node_modules/motion/') || id.includes('node_modules/framer-motion/')) {
              return 'vendor-motion';
            }
            if (id.includes('node_modules/@lottiefiles/') || id.includes('node_modules/lottie-react/')) {
              return 'vendor-lottie';
            }
          },
        },
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
