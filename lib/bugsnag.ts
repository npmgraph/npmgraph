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
  releaseStage: location.hostname.includes('npmgraph')
    ? 'production'
    : 'development',
  enabledReleaseStages: ['production'],
});

function info(reportError: Error) {
  console.log(reportError);
}

function warn(reportError: Error) {
  console.warn(reportError);
}

function error(reportError: Error) {
  console.error(reportError);

  if (reportError instanceof HttpError) {
    // Don't report HttpErrors since they're kind of expected from time to time
    return;
  }

  bugsnag?.notify(reportError);
}

export const report = { info, warn, error };
