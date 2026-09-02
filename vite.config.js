import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Project site lives at https://shaansen.github.io/until/
export default defineConfig({
  base: '/until/',
  plugins: [react()],
});
