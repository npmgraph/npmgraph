// Smoke test: serves dist/ in a browser and checks that a graph renders.
// Run `npm run build` first.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const ORIGIN = 'https://app.test';

const browser = await chromium.launch({channel: 'chrome'});
const page = await browser.newPage();

const errors: string[] = [];
page.on('pageerror', error => {
  errors.push(error.message);
});

// Serve dist/ without a server; every other origin (npm registry) goes to the network
await page.route(
  url => url.origin === ORIGIN,
  async route => {
    const { pathname } = new URL(route.request().url());
    const file = join('dist', pathname === '/' ? 'index.html' : pathname);
    return route.fulfill({ path: existsSync(file) ? file : 'dist/index.html' });
  },
);

await page.goto(`${ORIGIN}/?q=debug`);
await page.locator('svg g.node').first().waitFor({ timeout: 30_000 });
await browser.close();

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('smoke ok');
}
