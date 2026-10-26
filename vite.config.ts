import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import svgr from 'vite-plugin-svgr';
import { configDefaults, defineConfig, type Plugin } from 'vitest/config';

// GitHub Pages serves 404.html for unknown paths, e.g. /report/{module}. Serving
// the app from there lets it route client-side.
function spaFallback(): Plugin {
  return {
    name: 'spa-fallback',
    apply: 'build',
    // The HTML is only in the bundle after Vite's own plugins have processed it
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const index = bundle['index.html'];
        if (index?.type === 'asset') {
          this.emitFile({
            type: 'asset',
            fileName: '404.html',
            source: index.source,
          });
        }
      },
    },
  };
}

// eslint-disable-next-line unicorn/no-top-level-side-effects -- Vite config
export default defineConfig({
  // Absolute base so assets also resolve from nested paths, e.g. /report/{module}
  base: '/',
  plugins: [react(), svgr(), spaFallback()],
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
