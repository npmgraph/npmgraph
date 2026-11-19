import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { $ } from 'select-dom';
import App from '../components/App/App.tsx';
import { setActivityForApp } from '../hooks/useActivity.ts';
import { DiagramTitle } from './DiagramTitle.tsx';
import LoadActivity from './LoadActivity.ts';
import { syncPackagesHash } from './ModuleCache.ts';
import { setActivityForRequestCache } from './fetchJson.ts';
import { flashError } from './flash.ts';

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

globalThis.addEventListener('error', error => {
  // Browsers hide the details of cross-origin script errors, so there's nothing to show.
  // Safari on iOS throws one from `SharingLinkExtractorJS.viewportDominantIFrameHandle()`:
  // it's undocumented and looks for any iframe on the page, which we don't have.
  if (!error.filename) {
    return;
  }

  flashError(error.message);
});

globalThis.addEventListener('unhandledrejection', error => {
  flashError(error.reason);
});

function init() {
  // Make sure module cache is synced with hash param
  syncPackagesHash();

  // Inject LoadActivity dependencies
  const activity = new LoadActivity();
  setActivityForRequestCache(activity);
  setActivityForApp(activity);

  // Main app component
  const appElement = $('body');
  createRoot(appElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  // A little component for managing the title
  createRoot($('title')).render(<DiagramTitle defaultTitle={document.title} />);
}

init();
