import { playwright } from '@vitest/browser-playwright';
import { configDefaults, defineConfig } from 'vitest/config';

// eslint-disable-next-line unicorn/no-top-level-side-effects -- https://github.com/sindresorhus/eslint-plugin-unicorn/issues/3813
export default defineConfig({
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
          testTimeout: 60_000,
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
