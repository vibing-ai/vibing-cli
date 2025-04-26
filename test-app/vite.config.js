import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx']
  }
}); 