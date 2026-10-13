import Bugsnag, { type Event } from '@bugsnag/js';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@bugsnag/js', () => ({
  default: { start: vi.fn(() => ({ notify: vi.fn() })) },
}));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
  vi.mocked(Bugsnag.start).mockClear();
});

describe('Bugsnag configuration', () => {
  it('does not start without an API key', async () => {
    vi.stubEnv('BUGSNAG_KEY', '');

    await import('./bugsnag.ts');

    expect(Bugsnag.start).not.toHaveBeenCalled();
  });

  it.each([
    ['production', 'production'],
    ['preview', 'preview'],
  ])(
    'uses the %s Vercel release stage and commit SHA',
    async (vercelEnv, releaseStage) => {
      vi.stubEnv('BUGSNAG_KEY', 'test-key');
      vi.stubEnv('VERCEL_ENV', vercelEnv);
      vi.stubEnv('VERCEL_GIT_COMMIT_SHA', 'abc123');

      await import('./bugsnag.ts');

      expect(Bugsnag.start).toHaveBeenCalledWith(
        expect.objectContaining({
          appVersion: 'abc123',
          releaseStage,
          enabledReleaseStages: ['production', 'preview'],
        }),
      );
    },
  );

  it('uses "none" as the app version in development', async () => {
    vi.stubEnv('BUGSNAG_KEY', 'test-key');

    await import('./bugsnag.ts');

    expect(Bugsnag.start).toHaveBeenCalledWith(
      expect.objectContaining({
        appVersion: 'none',
        releaseStage: 'development',
      }),
    );
  });

  it('adds runtime metadata to events', async () => {
    vi.stubEnv('BUGSNAG_KEY', 'test-key');
    vi.stubGlobal('document', { visibilityState: 'visible' });
    vi.stubGlobal('navigator', { onLine: true });

    const { addRuntimeMetadata } = await import('./bugsnag.ts');
    const addMetadata = vi.fn();
    addRuntimeMetadata({ addMetadata } as unknown as Event);

    expect(addMetadata).toHaveBeenCalledWith(
      'runtime',
      expect.objectContaining({
        online: expect.any(Boolean),
        visibility: expect.any(String),
        secondsSincePageLoad: expect.any(Number),
      }),
    );
  });
});
