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
