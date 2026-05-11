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
  releaseStage: /npmgraph/v.test(location.hostname)
    ? 'production'
    : 'development',
  enabledReleaseStages: ['production'],
});

function info(error_: Error) {
  console.log(error_);
}

function warn(error_: Error) {
  console.warn(error_);
}

function error(error_: Error) {
  console.error(error_);

  if (error_ instanceof HttpError) {
    // Don't report HttpErrors since they're kind of expected from time to time
    return;
  }

  bugsnag?.notify(error_);
}

export const report = { info, warn, error };
