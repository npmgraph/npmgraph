import Bugsnag from '@bugsnag/js';
import HttpError from './HttpError.ts';

const apiKey = process.env.BUGSNAG_KEY;

const releaseStage =
  process.env.VERCEL_ENV === 'production'
    ? 'production'
    : process.env.VERCEL_ENV === 'preview'
      ? 'staging'
      : 'development';

const bugsnag = apiKey
  ? Bugsnag.start({
      appVersion: process.env.VERCEL_GIT_COMMIT_SHA,
      apiKey,
      releaseStage,
      enabledReleaseStages: ['production', 'staging'],
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
