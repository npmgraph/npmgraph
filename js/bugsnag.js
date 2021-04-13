/* global bugsnag */

import { version as appVersion } from '../package.json';

const config = {
  appVersion,
  apiKey: process.env.BUGSNAG_KEY,
  releaseStage: process.env.NODE_ENV
};

console.log('BugSnag config:', config);

const pageStart = Date.now();

export const client = config.apiKey
  ? bugsnag({
      ...config,
      notifyReleaseStages: ['production'],
      beforeSend: function(report) {
        report.updateMetaData('page', {
          location: String(location),
          pageTime: Date.now() - pageStart
        });
      }
    })
  : {
      notify(err, { severity }) {
        console[severity](err);
      }
    };
