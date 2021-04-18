/* global bugsnag */

import { version as appVersion } from '/package.json';

const config = {
  appVersion,
  apiKey: process.env.BUGSNAG_KEY,
  // Note: `parcel build` always sets NODE_ENV='production'.  This isn't really correct
  // the static files are served locally, however (e.g. `npx static-server docs`).
  // To avoid generating bugsnag reports in dev environments, we set the stage based
  // on hostname-sniffing.
  releaseStage: /npmgraph/.test(window.location.hostname) ? 'production' : 'development'
};

const bugsnagLoaded = typeof (bugsnag) != 'undefined';

if (bugsnagLoaded) {
  console.log('BugSnag config:', config);
} else {
  // Complain loudly-ish
  setTimeout(() => {
    throw Error('Bugsnag failed to load.  Maybe disable your ad blocker for this site?');
  });
}

const pageStart = Date.now();

let client = {
  notify(err, { severity }) {
    console[severity](err);
  }
};

if (bugsnagLoaded && config.apiKey) {
  client = bugsnag({
    ...config,
    notifyReleaseStages: ['production'],
    beforeSend: function(report) {
      report.updateMetaData('page', {
        location: String(location),
        pageTime: Date.now() - pageStart
      });
    }
  });
}

export { client };
