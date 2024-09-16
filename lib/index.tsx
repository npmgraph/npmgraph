import 'typed-query-selector';
import './bugsnag.js'; // Initialize ASAP!

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { $ } from 'select-dom';
import App, { setActivityForApp } from '../components/App/App.js';
import { Unsupported } from '../components/Unsupported.js';
import { DiagramTitle } from './DiagramTitle.js';
import LoadActivity from './LoadActivity.js';
import { syncPackagesHash } from './ModuleCache.js';
import { setActivityForRequestCache } from './fetchJSON.js';
import { flash } from './flash.js';

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
  const unsupported = new Map<string, JSX.Element>();

  // API checks
  const features = {
    '||= (Logical Or)': isValidJS('a ||= 123'),
    'AbortSignal.timeout': window.AbortSignal?.timeout,
    // @ts-expect-error remove this ignore once VSCode knows about groupBy
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

function loadConfetti() {
  // Parcel's import() function doesn't work with absolute URLs, so we have use
  // a bit of trickery to access the native import()
  //
  // eslint-disable-next-line no-new-func
  const dynamicImport = new Function('a', 'b', 'return import(a, b);');
  try {
    dynamicImport('https://esm.sh/canvas-confetti@1.9.3')
      .then(
        ({
          default: confetti,
        }: {
          default: (opts: { [key: string]: unknown }) => void;
        }) => {
          confetti({
            particleCount: 100,
            origin: { x: 0.5, y: 1 },
          });
        },
      )
      .catch((err: Error) => {
        console.error('Failed to load confetti', err);
      });
  } catch (err) {
    console.error('Blarg', err);
  }
}

loadConfetti();

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
    <StrictMode>
      <App />
    </StrictMode>,
  );

  // A little component for managing the title
  createRoot($('title')!).render(
    <DiagramTitle defaultTitle={document.title} />,
  );
};
