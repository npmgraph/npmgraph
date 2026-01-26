import 'typed-query-selector';
import './bugsnag.ts'; // Initialize ASAP!

import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { $ } from 'select-dom';
import App from '../components/App/App.tsx';
import { Unsupported } from '../components/Unsupported.tsx';
import { DiagramTitle } from './DiagramTitle.tsx';
import LoadActivity from './LoadActivity.ts';
import { syncPackagesHash } from './ModuleCache.ts';
import { setActivityForRequestCache } from './fetchJSON.ts';
import { flash } from './flash.ts';
import { setActivityForApp } from './useActivity.ts';

function isValidJS(src: string) {
  try {
    // eslint-disable-next-line no-new-func, no-new
    new Function(src);
    return true;
  } catch {
    return false;
  }
}

// Various features we depend on that have triggered bugsnag errors in the past
function detectFeatures() {
  const unsupported = new Map<string, ReactElement>();

  // API checks
  const features = {
    '||= (Logical Or)': isValidJS('a ||= 123'),
    'AbortSignal.timeout': window.AbortSignal?.timeout,
    'Map.groupBy': window.Map?.groupBy,
    fetch: window.fetch,
    globalThis: window.globalThis,
    Promise: window.Promise,
  };

  for (const [k, v] of Object.entries(features)) {
    if (v) continue;

    unsupported.set(
      k,
      <>
        <code>{k}</code> is not supported
      </>,
    );
  }

  // localStorage may not work if cookies are disabled. See #202
  try {
    window.localStorage.setItem('test', 'test');
    window.localStorage.removeItem('test');
  } catch {
    unsupported.set(
      'localStorage',
      <>
        <code>localStorage</code> is not supported
      </>,
    );
  }

  return unsupported;
}

window.addEventListener('error', err => {
  console.error(err);
  flash(err.message);
});

window.addEventListener('unhandledrejection', err => {
  console.error(err);
  flash(err.reason);
});

window.onload = function () {
  const unsupported = detectFeatures();
  if (unsupported.size > 0) {
    createRoot($('body')!).render(<Unsupported unsupported={unsupported} />);
    return;
  }

  // Make sure module cache is synced with hash param
  syncPackagesHash();

  // Inject LoadActivity dependencies
  const activity = new LoadActivity();
  setActivityForRequestCache(activity);
  setActivityForApp(activity);

  // Main app component
  const appEl = $('#app')!;
  createRoot(appEl).render(
    // <StrictMode>
    <App />,
    // </StrictMode>,
  );

  // A little component for managing the title
  createRoot($('title')!).render(
    <DiagramTitle defaultTitle={document.title} />,
  );
};
