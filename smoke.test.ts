// Smoke tests: load the built app (dist/) in an iframe and check that graphs render.
// Run `npm run build` first.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { type Locator, locators, page, userEvent } from 'vitest/browser';
import { $, $$, $$optional } from 'select-dom';

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

const searchValue = () => $('input#search-field', doc()).value;

const tab = (name: string) => app().getByRole('tab', { name, exact: true });

// Toggle is a button; its On/Off pill is aria-hidden (state is in aria-pressed)
const toggle = (label: string) =>
  app().getByRole('button', { name: label, exact: true });

// Wait for something to appear in the app's DOM
const appears = async (css: string, text?: RegExp) =>
  vi.waitFor(
    () => {
      const els = $$(css, doc());
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

// eslint-disable-next-line unicorn/no-unnecessary-parameters -- Readable
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
    await goto('?q=debug#deps=peerDependencies');
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
  it('keeps the search field in sync with query links', async () => {
    await goto('?q=debug');
    await nodeAppears('debug@');
    expect(searchValue()).toBe('debug');
    await userEvent.click(tab('Info'));
    await userEvent.click(app().getByRole('link', { name: 'express' }));
    await vi.waitFor(() => {
      expect(searchValue()).toBe('express');
    });
  });

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
    expect(searchValue()).toBe('debug');
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

describe('package.json input', () => {
  it('does not show local package names in the search field', async () => {
    await goto('?q=debug');
    await userEvent.click(tab('Info'));
    const fileInput = app().getByLabelText('Choose file');
    const upload = async (contents: object) => {
      await userEvent.upload(
        fileInput,
        new File([JSON.stringify(contents)], 'package.json', {
          type: 'application/json',
        }),
      );
    };

    await upload({ version: '1.0.1' });
    await vi.waitFor(() => {
      expect(win().location.search).toContain('unnamed-package-');
    });
    expect(searchValue()).toBe('');

    await upload({ name: 'local-package', version: '1.0.1' });
    await vi.waitFor(() => {
      expect(win().location.search).toContain('local-package');
    });
    expect(searchValue()).toBe('');
  });
});

describe('panes', () => {
  it('opens module pane on node click', async () => {
    await goto('?q=debug');
    await nodeAppears('debug@');
    await userEvent.click(node('debug@'));
    await appears('h2', /^debug@/);
  });

  it(
    'adds custom links to the module pane and stores them locally',
    async () => {
      localStorage.removeItem('npmgraph-custom-module-links');
      localStorage.removeItem('npmgraph-module-link-providers');
      await goto('?q=debug');
      await nodeAppears('debug@');
      await userEvent.click(node());
      await appears('h2', /^debug@/);
      const moduleVersion = $('h2', doc())?.textContent?.trim().slice(6);
      expect(
        $('a[href^="https://www.npmjs.com/package/debug/"]', doc()),
      ).toBeDefined();
      await userEvent.click(tab('View'));
      await userEvent.click(app().getByCSS('details > summary'));
      const textarea = $(
        'textarea[aria-label="Custom link providers for Module tab"]',
        doc(),
      );
      const defaultConfig = textarea?.value ?? '';
      expect(defaultConfig).toContain(
        'npm, https://www.npmjs.com/package/{+name}/v/{version}',
      );
      expect(defaultConfig).toContain('repo, {repository}');
      expect(defaultConfig).toContain('website, {homepage}');
      expect(defaultConfig).toContain(
        'package.json, https://unpkg.com/{+name}@{version}/package.json',
      );
      const previewButtons = $$(
        '[aria-label="Preview of Module tab link buttons"] button',
        doc(),
      );
      expect(previewButtons.map(button => button.textContent)).toEqual([
        'npm',
        'repo',
        'website',
        'package.json',
      ]);
      expect(previewButtons.every(button => button.disabled)).toBe(true);
      await userEvent.fill(
        app().getByRole('textbox', {
          name: 'Custom link providers for Module tab',
        }),
        'invalid row',
      );
      expect(
        $('textarea[aria-label="Custom link providers for Module tab"]', doc())
          ?.validationMessage,
      ).toBe(
        'Each non-empty row must contain a label and a valid HTTP(S) URL separated by a comma.',
      );
      await userEvent.fill(
        app().getByRole('textbox', {
          name: 'Custom link providers for Module tab',
        }),
        '',
      );
      expect(
        $('details > summary', doc())?.parentElement?.hasAttribute('open'),
      ).toBe(true);
      expect(doc().activeElement).toBe(
        $('textarea[aria-label="Custom link providers for Module tab"]', doc()),
      );
      const customConfig = [
        defaultConfig,
        'npmx,https://npmx.dev/package/{name}@{version}',
      ].join('\n');
      await userEvent.fill(
        app().getByRole('textbox', {
          name: 'Custom link providers for Module tab',
        }),
        customConfig,
      );
      expect(
        $$(
          '[aria-label="Preview of Module tab link buttons"] button',
          doc(),
        ).map(button => button.textContent),
      ).toContain('npmx');

      expect(win().localStorage.getItem('npmgraph-module-link-providers')).toBe(
        customConfig,
      );
      await userEvent.click(tab('Module'));
      await vi.waitFor(() => {
        expect(
          $('a[href^="https://npmx.dev/"]', doc())?.getAttribute('href'),
        ).toBe(`https://npmx.dev/package/debug@${moduleVersion}`);
      });
      await userEvent.click(tab('View'));
      expect(
        $('details > summary', doc())?.parentElement?.hasAttribute('open'),
      ).toBe(true);
      await userEvent.click(
        app().getByRole('button', { name: 'Reset to defaults' }),
      );
      expect(win().localStorage.getItem('npmgraph-module-link-providers')).toBe(
        defaultConfig,
      );
      await userEvent.click(tab('Module'));
      await vi.waitFor(() => {
        expect(
          $('a[href^="https://www.npmjs.com/package/debug/"]', doc()),
        ).toBeDefined();
      });
      expect($$optional('a[href^="https://npmx.dev/"]', doc())).toHaveLength(0);
      win().localStorage.removeItem('npmgraph-custom-module-links');
      win().localStorage.removeItem('npmgraph-module-link-providers');
    },
    TIMEOUT,
  );

  it('renders report items', async () => {
    await goto('?q=debug');
    await nodeAppears();
    await userEvent.click(tab('Report'));
    await Promise.all(
      ['Modules', 'Maintainers', 'Licenses'].map(async title =>
        appears('details > summary', new RegExp(title)),
      ),
    );
  });

  // Loading the devDependencies of `ms` takes longer than the default test timeout
  it(
    'toggles dependency types',
    async () => {
      await goto('?q=ms');
      await nodeAppears();
      await userEvent.click(tab('View'));
      await userEvent.click(toggle('Include devDependencies'));
      // hash value is "%2CdevDependencies" (leading empty entry), so match loosely
      await hashHas('devDependencies');
      await nodeAppears();
    },
    TIMEOUT,
  );

  it('toggles module sizing', async () => {
    await goto('?q=debug');
    await nodeAppears();
    await userEvent.click(tab('View'));
    await userEvent.click(toggle('Size modules by unpacked size'));
    await hashHas('sizing=');
    await nodeAppears();
  });
});
