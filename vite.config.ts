import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import svgr from 'vite-plugin-svgr';
import { configDefaults, defineConfig } from 'vitest/config';

// eslint-disable-next-line unicorn/no-top-level-side-effects -- Vite config
export default defineConfig({
  // Relative base so the site can be served from any subfolder
  base: './',
  plugins: [react(), svgr()],
  envPrefix: ['BUGSNAG_', 'VERCEL_', 'NPMGRAPH_'],
  build: {
    sourcemap: true,
  },
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          exclude: [...configDefaults.exclude, 'smoke.test.ts'],
        },
      },
      {
        // Serve the built app (npm run build) at the dev server root
        publicDir: 'dist',
        test: {
          name: 'smoke',
          include: ['smoke.test.ts'],
          testTimeout: 3000,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({ launchOptions: { channel: 'chrome' } }),
            instances: [{ browser: 'chromium' }],
            viewport: { width: 1280, height: 800 },
          },
        },
      },
    ],
  },
});
