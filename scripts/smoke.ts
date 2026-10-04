// Smoke test: serves dist/ in a browser and checks that a graph renders.
// Run `npm run build` first.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, type Page } from 'playwright';

const ORIGIN = 'https://app.test';
const TIMEOUT = 30_000;

const browser = await chromium.launch({ channel: 'chrome' });

const node = (page: Page, module = '') =>
  page.locator(`svg g.node${module && `[data-module^="${module}"]`}`);

const tab = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true });

const scenarios: Record<string, (page: Page) => Promise<unknown>> = {
  async 'renders graph for single module'(page) {
    await page.goto(`${ORIGIN}/?q=debug`);
    await node(page).first().waitFor({ timeout: TIMEOUT });
  },

  async 'renders graph for multiple modules'(page) {
    await page.goto(`${ORIGIN}/?q=debug,ms`);
    await node(page, 'debug@').first().waitFor({ timeout: TIMEOUT });
    await node(page, 'ms@').first().waitFor({ timeout: TIMEOUT });
  },

  async 'renders graph for pinned version'(page) {
    await page.goto(`${ORIGIN}/?q=ms@2.1.3`);
    await node(page, 'ms@2.1.3').waitFor({ timeout: TIMEOUT });
  },

  async 'renders graph for scoped module'(page) {
    await page.goto(`${ORIGIN}/?q=@babel/helper-validator-identifier`);
    await node(page, '@babel/helper-validator-identifier@').waitFor({
      timeout: TIMEOUT,
    });
  },

  async 'survives unknown module'(page) {
    await page.goto(`${ORIGIN}/?q=npmgraph-no-such-module-xyz`);
    await page.locator('#search-field').waitFor({ timeout: TIMEOUT });
    await page.waitForTimeout(2000);
  },

  async 'survives empty query'(page) {
    await page.goto(`${ORIGIN}/`);
    await page.locator('#search-field').waitFor({ timeout: TIMEOUT });
  },

  async 'search form updates graph and url'(page) {
    await page.goto(`${ORIGIN}/?q=debug`);
    await node(page, 'debug@').first().waitFor({ timeout: TIMEOUT });
    await page.locator('#search-field').fill('ms');
    await page.locator('#search-field').press('Enter');
    await page.waitForURL(/[&?]q=ms(&|$)/);
    await node(page, 'ms@').first().waitFor({ timeout: TIMEOUT });
  },

  async '"/" focuses search field'(page) {
    await page.goto(`${ORIGIN}/?q=ms`);
    await node(page).first().waitFor({ timeout: TIMEOUT });
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('/');
    await page.locator('#search-field:focus').waitFor({ timeout: TIMEOUT });
  },

  async 'clicking node opens module pane'(page) {
    await page.goto(`${ORIGIN}/?q=debug`);
    await node(page, 'debug@').first().click({ timeout: TIMEOUT });
    await page
      .locator('h2', { hasText: /^debug@/ })
      .first()
      .waitFor({ timeout: TIMEOUT });
  },

  async 'report pane renders sections'(page) {
    await page.goto(`${ORIGIN}/?q=debug`);
    await node(page).first().waitFor({ timeout: TIMEOUT });
    await tab(page, 'Report').click();
    for (const title of ['Modules', 'Maintainers', 'Licenses']) {
      await page
        .locator('h3', { hasText: title })
        .waitFor({ timeout: TIMEOUT });
    }
  },

  async 'settings pane toggles dependency types'(page) {
    await page.goto(`${ORIGIN}/?q=ms`);
    await node(page).first().waitFor({ timeout: TIMEOUT });
    await tab(page, 'Settings').click();
    await page.getByText('Include devDependencies').click();
    await page.waitForURL(/#.*deps=devDependencies/);
    await node(page).first().waitFor({ timeout: TIMEOUT });
  },

  async 'settings pane toggles module sizing'(page) {
    await page.goto(`${ORIGIN}/?q=debug`);
    await node(page).first().waitFor({ timeout: TIMEOUT });
    await tab(page, 'Settings').click();
    await page.getByText('Size modules by unpacked size').click();
    await page.waitForURL(/#.*sizing=/);
    await node(page).first().waitFor({ timeout: TIMEOUT });
  },

  async 'hash params restore state'(page) {
    await page.goto(`${ORIGIN}/?q=debug#deps=peerDependencies&zoom=w`);
    await node(page).first().waitFor({ timeout: TIMEOUT });
  },

  async 'hidden inspector still renders graph'(page) {
    await page.goto(`${ORIGIN}/?q=debug#hide`);
    await node(page).first().waitFor({ timeout: TIMEOUT });
    await tab(page, 'Info').waitFor({ state: 'visible', timeout: TIMEOUT });
  },

  async 'selection in hash highlights node'(page) {
    await page.goto(`${ORIGIN}/?q=debug#select=ms`);
    await node(page, 'ms@').first().waitFor({ timeout: TIMEOUT });
  },

  async 'back button restores previous query'(page) {
    await page.goto(`${ORIGIN}/?q=debug`);
    await node(page, 'debug@').first().waitFor({ timeout: TIMEOUT });
    await page.locator('#search-field').fill('ms');
    await page.locator('#search-field').press('Enter');
    await node(page, 'ms@').first().waitFor({ timeout: TIMEOUT });
    await page.goBack();
    await node(page, 'debug@').first().waitFor({ timeout: TIMEOUT });
  },
};

let isFailed = false;

for (const [name, run] of Object.entries(scenarios)) {
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
      return route.fulfill({
        path: existsSync(file) ? file : 'dist/index.html',
      });
    },
  );

  try {
    await run(page);
    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }

    console.log(`ok   ${name}`);
  } catch (error) {
    isFailed = true;
    console.error(
      `FAIL ${name}\n${error instanceof Error ? error.message : error}`,
    );
  } finally {
    await page.close();
  }
}

await browser.close();

if (isFailed) {
  process.exitCode = 1;
} else {
  console.log('smoke ok');
}
