import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Otimizações de bundle
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk: React e bibliotecas principais
          'react-vendor': ['react', 'react-dom'],
          // UI chunk: Lucide icons
          'ui-vendor': ['lucide-react'],
        },
      },
    },
    // Compressão e otimizações
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs em produção
        drop_debugger: true,
        passes: 2, // Multiple passes para melhor minificação
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      format: {
        comments: false, // Remove comentários
      },
    },
    // Desabilita source maps em produção (economiza ~50KB)
    sourcemap: false,
    // Aumenta limite de warning para chunks grandes
    chunkSizeWarningLimit: 1000,
    // Otimizações de CSS
    cssCodeSplit: true,
  },
  // Otimizações de servidor dev
  server: {
    host: true,
  },
});
