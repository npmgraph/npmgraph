import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import type { Plugin } from 'vite';
import svgr from 'vite-plugin-svgr';
import { configDefaults, defineConfig } from 'vitest/config';

// The app is a dynamic import of bootstrap.ts: fetch it (and graphviz) right away instead of after the entry point runs
const preloadApp = {
  name: 'preload-app',
  transformIndexHtml: {
    order: 'post',
    handler(_html, { bundle = {} }) {
      const app = Object.values(bundle).find(
        chunk =>
          chunk.type === 'chunk' &&
          chunk.facadeModuleId?.endsWith('/lib/index.tsx'),
      );
      if (app?.type !== 'chunk') {
        return [];
      }

      // Graphviz is a separate chunk that the app fetches right away
      const graphviz = Object.values(bundle).find(
        chunk =>
          chunk.type === 'chunk' &&
          chunk.moduleIds.some(id => id.includes('@hpcc-js/wasm-graphviz')),
      );

      return [
        ...[...(app.viteMetadata?.importedCss ?? [])].map(href => ({
          tag: 'link',
          attrs: { rel: 'stylesheet', crossorigin: true, href: `./${href}` },
        })),
        ...[app, graphviz].filter(Boolean).map(chunk => ({
          tag: 'link',
          attrs: {
            rel: 'modulepreload',
            crossorigin: true,
            href: `./${chunk!.fileName}`,
          },
        })),
      ];
    },
  },
} satisfies Plugin;

export default defineConfig({
  // Relative base so the site can be served from any subfolder
  base: './',
  plugins: [react(), svgr(), preloadApp],
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
        // Scan the app too, or Vite finds its dependencies mid-test and reloads
        optimizeDeps: { entries: ['smoke.test.ts', 'index.html'] },
        test: {
          name: 'smoke',
          include: ['smoke.test.ts'],
          // Bumping this timeout is NOT the solution to flaky smoke tests
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
