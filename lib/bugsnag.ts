/* eslint-disable @typescript-eslint/no-shadow */
import Bugsnag from '@bugsnag/js';
import pkg from '../package.json' with { type: 'json' };
import HttpError from './HttpError.ts';

const apiKey = process.env.BUGSNAG_KEY;

if (!apiKey) {
  throw new Error('BUGSNAG_KEY environment variable is not set');
}

const bugsnag = Bugsnag.start({
  appVersion: pkg.version,
  apiKey,
  releaseStage: /npmgraph/.test(location.hostname)
    ? 'production'
    : 'development',
  enabledReleaseStages: ['production'],
});

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
