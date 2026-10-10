import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LoadActivity from '../lib/LoadActivity.ts';
import { setActivityForApp } from './useActivity.ts';
import { patchLocation } from './useLocation.ts';

// The location hook uses these globals as soon as it's imported
vi.hoisted(() => {
  vi.stubGlobal('location', new URL('https://example.test/?q=express'));
  vi.stubGlobal('addEventListener', vi.fn());
  vi.stubGlobal('history', { pushState: vi.fn(), replaceState: vi.fn() });
});

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('patchLocation', () => {
  it('shows activity when an input changes nothing', () => {
    const activity = new LoadActivity();
    setActivityForApp(activity);

    patchLocation({ search: '?q=express' }, false, { isInput: true });
    expect(activity.active).toBe(1);

    vi.advanceTimersByTime(500);
    expect(activity.active).toBe(0);
  });

  it('does not when something else changes nothing (e.g. clicking the graph)', () => {
    const activity = new LoadActivity();
    setActivityForApp(activity);

    patchLocation({ search: '?q=express' }, false);
    expect(activity.active).toBe(0);
  });

  it('does not when the location changes', () => {
    const activity = new LoadActivity();
    setActivityForApp(activity);

    patchLocation({ search: '?q=react' }, false);
    expect(activity.active).toBe(0);
  });
});
