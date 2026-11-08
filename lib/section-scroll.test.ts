import { beforeEach, describe, expect, it, vi } from 'vitest';

const listeners = vi.hoisted(() => new Map<string, () => void>());

async function load(hash: string) {
  vi.resetModules();
  listeners.clear();
  vi.stubGlobal('location', new URL(`https://example.test/?q=express${hash}`));
  vi.stubGlobal(
    'addEventListener',
    vi.fn<(type: string, listener: () => void) => void>((type, listener) => {
      listeners.set(type, listener);
    }),
  );
  return import('./section-scroll.ts');
}

function navigate(hash: string) {
  location.hash = hash;
  listeners.get('hashchange')?.();
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('consumeSectionScroll', () => {
  it('scrolls to the section from the URL on load', async () => {
    const { consumeSectionScroll } = await load('#section=size');
    expect(consumeSectionScroll('size')).toBe(true);
  });

  it('ignores other sections', async () => {
    const { consumeSectionScroll } = await load('#section=size');
    expect(consumeSectionScroll('licenses')).toBe(false);
  });

  it('does not scroll again when the section remounts (e.g. new query)', async () => {
    const { consumeSectionScroll } = await load('#section=size');
    expect(consumeSectionScroll('size')).toBe(true);
    expect(consumeSectionScroll('size')).toBe(false);
  });

  it('scrolls when the user navigates to a section', async () => {
    const { consumeSectionScroll } = await load('');
    expect(consumeSectionScroll('size')).toBe(false);

    navigate('#section=size');
    expect(consumeSectionScroll('size')).toBe(true);
    expect(consumeSectionScroll('size')).toBe(false);
  });

  it('does not scroll when there is no section', async () => {
    const { consumeSectionScroll } = await load('#tab=report');
    expect(consumeSectionScroll('size')).toBe(false);
  });
});
