import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Project site lives at https://shaansen.github.io/ead-approval-countdown/
export default defineConfig({
  base: '/ead-approval-countdown/',
  plugins: [react()],
});
