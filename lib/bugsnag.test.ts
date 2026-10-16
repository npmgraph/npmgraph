import { afterEach, describe, expect, it, vi } from 'vitest';
import Bugsnag from '@bugsnag/js';

vi.mock('@bugsnag/js', () => ({
  default: { start: vi.fn(() => ({ notify: vi.fn() })) },
}));

afterEach(() => {
  vi.unstubAllEnvs();
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
    ['NPMGRAPH_ENV', 'NPMGRAPH_COMMIT_SHA', 'production'],
    ['VERCEL_ENV', 'VERCEL_GIT_COMMIT_SHA', 'preview'],
  ])(
    'uses %s for release stage and commit SHA',
    async (environmentVariable, commitShaVariable, releaseStage) => {
      vi.stubEnv('BUGSNAG_KEY', 'test-key');
      vi.stubEnv(environmentVariable, releaseStage);
      vi.stubEnv(commitShaVariable, 'abc123');

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
});
