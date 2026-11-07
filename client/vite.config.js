import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Electron builds use mode=electron → relative paths
  // Web builds (default) → absolute paths
  const isElectron = process.env.BUILD_TARGET === 'electron';

  return {
    plugins: [react()],
    base: isElectron ? './' : '/',   // ← conditional
    server: {
      port: 5173,
      proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } }
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true
    }
  };
});