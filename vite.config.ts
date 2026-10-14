import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// eslint-disable-next-line unicorn/no-top-level-side-effects -- Vite config
export default defineConfig({
  plugins: [react(), svgr({ include: '**/*.svg?react' })],
  envPrefix: ['BUGSNAG_', 'VERCEL_'],
});
