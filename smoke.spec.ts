// Smoke tests: serve dist/ in a browser and check that graphs render.
// Run `npm run build` first.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

const ORIGIN = 'https://app.test';
const TIMEOUT = 30_000;

let browser: Browser;
let page: Page;
let errors: string[];

const goto = (path: string) => page.goto(`${ORIGIN}${path}`);

const node = (module = '') =>
  page.locator(`svg g.node${module && `[data-module^="${module}"]`}`).first();

const tab = (name: string) => page.getByRole('button', { name, exact: true });

// Toggle's click handler lives on its On/Off switch, not the label text
const toggle = (label: string) =>
  page.locator('label', { hasText: label }).locator('div').first();

const search = async (q: string) => {
  await page.locator('#search-field').fill(q);
  await page.locator('#search-field').press('Enter');
};

const hashHas = (s: string) =>
  page.waitForFunction(s => location.hash.includes(s), s);

beforeAll(async () => {
  browser = await chromium.launch({ channel: 'chrome' });
});

afterAll(async () => {
  await browser.close();
});

beforeEach(async () => {
  page = await browser.newPage();
  page.setDefaultTimeout(TIMEOUT);
  errors = [];
  page.on('pageerror', error => errors.push(error.message));

  // Serve dist/ without a server; every other origin (npm registry) goes to the network
  await page.route(
    url => url.origin === ORIGIN,
    route => {
      const { pathname } = new URL(route.request().url());
      const file = join('dist', pathname === '/' ? 'index.html' : pathname);
      return route.fulfill({
        path: existsSync(file) ? file : 'dist/index.html',
      });
    },
  );
});

afterEach(async () => {
  await page.close();
  expect(errors).toEqual([]);
});

describe('graph', () => {
  it('renders single module', async () => {
    await goto('/?q=debug');
    await node().waitFor();
  });

  it('renders multiple modules', async () => {
    await goto('/?q=debug,ms');
    await node('debug@').waitFor();
    await node('ms@').waitFor();
  });

  it('renders pinned version', async () => {
    await goto('/?q=ms@2.1.3');
    await node('ms@2.1.3').waitFor();
  });

  it('renders scoped module', async () => {
    await goto('/?q=@babel/helper-validator-identifier');
    await node('@babel/helper-validator-identifier@').waitFor();
  });

  it('survives unknown module', async () => {
    await goto('/?q=npmgraph-no-such-module-xyz');
    await page.locator('#search-field').waitFor();
    await page.waitForTimeout(2_000);
  });

  it('survives empty query', async () => {
    await goto('/');
    await page.locator('#search-field').waitFor();
  });

  it('restores state from hash params', async () => {
    await goto('/?q=debug#deps=peerDependencies&zoom=w');
    await node().waitFor();
  });

  it('highlights node selected via hash', async () => {
    await goto('/?q=debug#select=ms');
    await node('ms@').waitFor();
  });

  it('renders with inspector hidden', async () => {
    await goto('/?q=debug#hide');
    await node().waitFor();
    await tab('Info').waitFor({ state: 'visible' });
  });
});

describe('navigation', () => {
  it('search updates graph and url', async () => {
    await goto('/?q=debug');
    await node('debug@').waitFor();
    await search('ms');
    await page.waitForURL(/[?&]q=ms(&|$)/);
    await node('ms@').waitFor();
  });

  it('back button restores previous query', async () => {
    await goto('/?q=debug');
    await node('debug@').waitFor();
    await search('ms');
    await node('ms@').waitFor();
    await page.goBack();
    await node('debug@').waitFor();
  });

  it('"/" focuses search field', async () => {
    await goto('/?q=ms');
    await node().waitFor();
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('/');
    await page.locator('#search-field:focus').waitFor();
  });
});

describe('panes', () => {
  it('opens module pane on node click', async () => {
    await goto('/?q=debug');
    await node('debug@').click();
    await page
      .locator('h2', { hasText: /^debug@/ })
      .first()
      .waitFor();
  });

  it('renders report sections', async () => {
    await goto('/?q=debug');
    await node().waitFor();
    await tab('Report').click();
    for (const title of ['Modules', 'Maintainers', 'Licenses']) {
      await page.locator('h3', { hasText: title }).waitFor();
    }
  });

  it('toggles dependency types', async () => {
    await goto('/?q=ms');
    await node().waitFor();
    await tab('Settings').click();
    await toggle('Include devDependencies').click();
    await hashHas('deps=devDependencies');
    await node().waitFor();
  });

  it('toggles module sizing', async () => {
    await goto('/?q=debug');
    await node().waitFor();
    await tab('Settings').click();
    await toggle('Size modules by unpacked size').click();
    await hashHas('sizing=');
    await node().waitFor();
  });
});
