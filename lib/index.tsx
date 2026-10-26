import '../index.scss';

import { lazy, Suspense, type ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { $ } from 'select-dom';
import App from '../components/App/App.tsx';
import { Unsupported } from '../components/Unsupported.tsx';
import { setActivityForApp } from '../hooks/useActivity.ts';
import { DiagramTitle } from './DiagramTitle.tsx';
import LoadActivity from './LoadActivity.ts';
import { syncPackagesHash } from './ModuleCache.ts';
import { setActivityForRequestCache } from './fetchJson.ts';
import { disableBugsnag } from './bugsnag.ts';
import { flash } from './flash.ts';
import { REPORT_PATH_PREFIX } from './report-util.ts';

// Only needed on /report/{module}
const ReportPage = lazy(
  async () => import('../components/ReportPage/ReportPage.tsx'),
);

// A deploy likely replaced the fingerprinted chunks this page references
globalThis.addEventListener('vite:preloadError', event => {
  event.preventDefault();

  // Throttle reload loops
  const now = Date.now();
  const lastReload = Date.parse(
    sessionStorage.getItem('preloadReloaded') ?? '0',
  );
  if (now - lastReload < 30_000) {
    return;
  }

  sessionStorage.setItem('preloadReloaded', now.toString());

  globalThis.location.reload();
});

function isValidJS(src: string) {
  try {
    // eslint-disable-next-line no-new-func, no-new, react-doctor/no-eval -- Only called with hard-coded snippets, to detect syntax support
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
    'AbortSignal.timeout': globalThis.AbortSignal?.timeout,
    'Map.groupBy': globalThis.Map?.groupBy,
    'URL.parse': globalThis.URL?.parse,
    fetch: globalThis.fetch,
    globalThis: typeof globalThis !== 'undefined',
    Promise: globalThis.Promise,
  };

  for (const [k, v] of Object.entries(features)) {
    if (v) {
      continue;
    }

    unsupported.set(
      k,
      <>
        <code>{k}</code> is not supported
      </>,
    );
  }

  // LocalStorage may not work if cookies are disabled. See #202
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
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

globalThis.addEventListener('error', error => {
  console.error(error);
  flash(error.message);
});

globalThis.addEventListener('unhandledrejection', error => {
  console.error(error);
  flash(error.reason);
});

globalThis.addEventListener('load', () => {
  const unsupported = detectFeatures();
  if (unsupported.size > 0) {
    disableBugsnag();
    createRoot($('body')).render(<Unsupported unsupported={unsupported} />);
    return;
  }

  // Make sure module cache is synced with hash param
  syncPackagesHash();

  // Inject LoadActivity dependencies
  const activity = new LoadActivity();
  setActivityForRequestCache(activity);
  setActivityForApp(activity);

  // Standalone report page, without the app (or its title management)
  if (globalThis.location.pathname.startsWith(REPORT_PATH_PREFIX)) {
    createRoot($('body')).render(
      <Suspense fallback={null}>
        <ReportPage />
      </Suspense>,
    );
    return;
  }

  // Main app component
  const appElement = $('body');
  createRoot(appElement).render(
    // <StrictMode>
    <App />,
    // </StrictMode>,
  );

  // A little component for managing the title
  createRoot($('title')).render(<DiagramTitle defaultTitle={document.title} />);
});
