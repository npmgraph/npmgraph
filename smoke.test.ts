// Smoke tests: load the built app (dist/) in an iframe and check that graphs render.
// Run `npm run build` first.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { type Locator, locators, page, userEvent } from 'vitest/browser';

declare module 'vitest/browser' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- needed for declaration merging
  interface LocatorSelectors {
    getByCSS: (css: string) => Locator;
  }
}

locators.extend({ getByCSS: css => `css=${css}` });

const TIMEOUT = 30_000;

let iframe: HTMLIFrameElement;
let errors: string[] = [];

const win = () => iframe.contentWindow!;
const doc = () => iframe.contentDocument!;
const app = () => page.frameLocator(page.elementLocator(iframe));

const node = (module = '') =>
  app()
    .getByCSS(`svg g.node${module && `[data-module^="${module}"]`}`)
    .first();

const tab = (name: string) => app().getByRole('button', { name, exact: true });

// Toggle is a button; its On/Off pill is aria-hidden (state is in aria-pressed)
const toggle = (label: string) =>
  app().getByRole('button', { name: label, exact: true });

// Wait for something to appear in the app's DOM
const appears = async (css: string, text?: RegExp) =>
  vi.waitFor(
    () => {
      const els = [...doc().querySelectorAll(css)];
      expect(
        text ? els.filter(element => text.test(element.textContent)) : els,
      ).not.toHaveLength(0);
    },
    { timeout: TIMEOUT },
  );

const hashHas = async (s: string) =>
  vi.waitFor(
    () => {
      expect(win().location.hash).toContain(s);
    },
    {
      timeout: TIMEOUT,
    },
  );

async function goto(path: string) {
  errors = [];
  iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;inset:0;width:1280px;height:800px';
  document.body.append(iframe);
  iframe.src = `/index.html${path}`;
  await new Promise(resolve => {
    iframe.addEventListener('load', resolve, { once: true });
  });

  win().addEventListener('error', event => {
    errors.push(event.message);
  });
  win().addEventListener('unhandledrejection', event => {
    errors.push(String(event.reason));
  });
}

const nodeAppears = async (module = '') =>
  appears(`svg g.node${module && `[data-module^="${module}"]`}`);

const search = async (q: string) => {
  const input = app().getByCSS('#search-field');
  await userEvent.fill(input, q);
  await userEvent.keyboard('{Enter}');
};

afterEach(() => {
  iframe.remove();
  expect(errors).toEqual([]);
});

describe('graph', () => {
  it('renders single module', async () => {
    await goto('?q=debug');
    await nodeAppears();
  });

  it('renders multiple modules', async () => {
    await goto('?q=debug,ms');
    await nodeAppears('debug@');
    await nodeAppears('ms@');
  });

  it('renders pinned version', async () => {
    await goto('?q=ms@2.1.3');
    await nodeAppears('ms@2.1.3');
  });

  it('renders scoped module', async () => {
    await goto('?q=@babel/helper-validator-identifier');
    await nodeAppears('@babel/helper-validator-identifier@');
  });

  it('survives unknown module', async () => {
    await goto('?q=npmgraph-no-such-module-xyz');
    await appears('#search-field');
    await new Promise(resolve => {
      setTimeout(resolve, 2000);
    });
  });

  it('survives empty query', async () => {
    await goto('');
    await appears('#search-field');
  });

  it('restores state from hash params', async () => {
    await goto('?q=debug#deps=peerDependencies&zoom=w');
    await nodeAppears();
  });

  it('highlights node selected via hash', async () => {
    await goto('?q=debug#select=ms');
    await nodeAppears('ms@');
  });

  it('renders with inspector hidden', async () => {
    await goto('?q=debug#hide');
    await nodeAppears();
    await appears('button', /^Info$/);
  });
});

describe('navigation', () => {
  it('search updates graph and url', async () => {
    await goto('?q=debug');
    await nodeAppears('debug@');
    await search('ms');
    await vi.waitFor(() => {
      expect(win().location.search).toMatch(/[&?]q=ms(?:&|$)/);
    });
    await nodeAppears('ms@');
  });

  it('back button restores previous query', async () => {
    await goto('?q=debug');
    await nodeAppears('debug@');
    await search('ms');
    await nodeAppears('ms@');
    win().history.back();
    await vi.waitFor(() => {
      expect(win().location.search).toContain('q=debug');
    });
    await nodeAppears('debug@');
  });

  it('"/" focuses search field', async () => {
    await goto('?q=ms');
    await nodeAppears();
    await userEvent.click(app().getByCSS('body'));
    await userEvent.keyboard('/');
    await vi.waitFor(() => {
      expect(doc().activeElement?.id).toBe('search-field');
    });
  });
});

describe('panes', () => {
  it('opens module pane on node click', async () => {
    await goto('?q=debug');
    await nodeAppears('debug@');
    await userEvent.click(node('debug@'));
    await appears('h2', /^debug@/);
  });

  it('renders report sections', async () => {
    await goto('?q=debug');
    await nodeAppears();
    await userEvent.click(tab('Report'));
    await Promise.all(
      ['Modules', 'Maintainers', 'Licenses'].map(async title =>
        appears('h3', new RegExp(title)),
      ),
    );
  });

  it('toggles dependency types', async () => {
    await goto('?q=ms');
    await nodeAppears();
    await userEvent.click(tab('Settings'));
    await userEvent.click(toggle('Include devDependencies'));
    // hash value is "%2CdevDependencies" (leading empty entry), so match loosely
    await hashHas('devDependencies');
    await nodeAppears();
  });

  it('toggles module sizing', async () => {
    await goto('?q=debug');
    await nodeAppears();
    await userEvent.click(tab('Settings'));
    await userEvent.click(toggle('Size modules by unpacked size'));
    await hashHas('sizing=');
    await nodeAppears();
  });
});
