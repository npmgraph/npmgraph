import Bugsnag from '@bugsnag/js';
import { version as appVersion } from '../package.json';
import HttpError from './util/HttpError.js';

const bugsnag = Bugsnag.default.start({
  appVersion,
  apiKey: process.env.BUGSNAG_KEY,
  releaseStage: /npmgraph/.test(window.location.hostname)
    ? 'production'
    : 'development',
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
