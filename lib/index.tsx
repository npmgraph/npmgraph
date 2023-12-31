import './bugsnag.js'; // Initialize ASAP!

import React from 'react';
import { createRoot } from 'react-dom/client';
import App, { setActivityForApp } from '../components/App/App.js';
import { DiagramTitle } from './DiagramTitle.js';
import LoadActivity from './LoadActivity.js';
import { syncPackagesHash } from './ModuleCache.js';
import { setActivityForRequestCache } from './fetchJSON.js';
import { flash } from './flash.js';
import { fetchCommits } from './useCommits.js';
import { Unsupported } from '../components/Unsupported.js';

// Various features we depend on that have triggered bugsnag errors in the past
function hasExpectedFeatures() {
  if (!window.Promise) return false;
  if (!window.fetch) return false;
  if (!window.AbortSignal?.timeout) return false;

  return false;
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
  if (!hasExpectedFeatures()) {
    createRoot(document.querySelector('body')!).render(<Unsupported />);
    return;
  }

  // Make sure module cache is synced with hash param
  syncPackagesHash();

  // Inject LoadActivity dependencies
  const activity = new LoadActivity();
  setActivityForRequestCache(activity);
  setActivityForApp(activity);

  // Main app component
  const appEl = document.querySelector('#app') as HTMLDivElement;
  createRoot(appEl).render(<App />);

  // A little component for managing the title
  const titleEl = document.querySelector('title') as HTMLTitleElement;
  createRoot(titleEl).render(<DiagramTitle defaultTitle={titleEl.innerText} />);

  // Lazily fetch information about commits to the npmgraph repo
  setTimeout(fetchCommits, 1000);
};
