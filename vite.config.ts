import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const targetUrl = env.VITE_EVOLUTION_SERVER_URL || 'http://localhost:8080';
  const apiKey = env.VITE_EVOLUTION_API_KEY || '';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/evolution': {
          target: targetUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/evolution/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Origin', targetUrl);
              if (apiKey) {
                proxyReq.setHeader('apikey', apiKey);
              }
            });
          }
        }
      }
    }
  };
});
