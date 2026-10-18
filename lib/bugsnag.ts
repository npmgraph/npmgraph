import Bugsnag from '@bugsnag/js';
import HttpError from './HttpError.ts';

const apiKey = import.meta.env.BUGSNAG_KEY;

export const releaseStage =
  import.meta.env.NPMGRAPH_ENV ?? import.meta.env.VERCEL_ENV ?? 'development';
export const appVersion =
  import.meta.env.NPMGRAPH_COMMIT_SHA ??
  import.meta.env.VERCEL_GIT_COMMIT_SHA ??
  'none';

const bugsnag = apiKey
  ? Bugsnag.start({
      appVersion,
      apiKey,
      releaseStage,
      enabledReleaseStages: ['production', 'preview'],
      onError(event) {
        // Don't report HttpErrors since they're kind of expected from time to time
        if (event.originalError instanceof HttpError) {
          return false;
        }

        const message = event.errors[0]?.errorMessage ?? '';
        const exclude = [
          'Failed to fetch dynamically imported module',
          'Unable to preload CSS',
        ];
        // Stale chunks after a deploy; handled by reload in index.tsx
        return exclude.every(item => !message.includes(item));
      },
    })
  : undefined;

function notify(
  error: Error,
  severity: 'info' | 'warning' | 'error',
  onSent?: () => void,
) {
  if (!bugsnag) {
    onSent?.();
    return;
  }

  bugsnag.notify(
    error,
    event => {
      event.severity = severity;
    },
    () => onSent?.(),
  );
}

function info(error: Error, onSent?: () => void) {
  notify(error, 'info', onSent);
}

function warn(error: Error, onSent?: () => void) {
  notify(error, 'warning', onSent);
}

function error(error: Error, onSent?: () => void) {
  notify(error, 'error', onSent);
}

export const report = { info, warn, error };
