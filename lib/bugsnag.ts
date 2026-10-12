import Bugsnag, { type Event } from '@bugsnag/js';
import HttpError from './HttpError.ts';

const apiKey = process.env.BUGSNAG_KEY;

export const releaseStage = process.env.VERCEL_ENV ?? 'development';
export const appVersion = process.env.VERCEL_GIT_COMMIT_SHA ?? 'none';

type NetworkInformation = { effectiveType?: string; saveData?: boolean };

// Context for telling stale-deploy and flaky-network failures apart
export function addRuntimeMetadata(event: Event) {
  const { connection } = navigator as Navigator & {
    connection?: NetworkInformation;
  };

  event.addMetadata('runtime', {
    online: navigator.onLine,
    visibility: document.visibilityState,
    effectiveType: connection?.effectiveType,
    saveData: connection?.saveData,
    secondsSincePageLoad: Math.round(performance.now() / 1000),
  });
}

const bugsnag = apiKey
  ? Bugsnag.start({
      appVersion,
      apiKey,
      releaseStage,
      enabledReleaseStages: ['production', 'preview'],
      onError: addRuntimeMetadata,
    })
  : undefined;

function info(error: Error) {
  console.log(error);
}

function warn(error: Error) {
  console.warn(error);
}

function error(error: Error) {
  console.error(error);

  if (error instanceof HttpError) {
    // Don't report HttpErrors since they're kind of expected from time to time
    return;
  }

  bugsnag?.notify(error);
}

export const report = { info, warn, error };
