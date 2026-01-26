import Bugsnag from '@bugsnag/js';
import pkg from '../package.json' with { type: 'json' };
import HttpError from './HttpError.ts';

// eslint-disable-next-line node/prefer-global/process
const apiKey = process.env.BUGSNAG_KEY;

if (!apiKey) {
  throw new Error('BUGSNAG_KEY environment variable is not set');
}

const bugsnag = Bugsnag.start({
  appVersion: pkg.version,
  apiKey,
  releaseStage: /npmgraph/.test(window.location.hostname)
    ? 'production'
    : 'development',
  enabledReleaseStages: ['production'],
});

function info(err: Error) {
  console.log(err);
}

function warn(err: Error) {
  console.warn(err);
}

function error(err: Error) {
  console.error(err);

  if (err instanceof HttpError) {
    // Don't report HttpErrors since they're kind of expected from time to time
    return;
  }

  bugsnag?.notify(err);
}

export const report = { info, warn, error };
