import './bugsnag.js'; // Initialize ASAP!

import React from 'react';
import { createRoot } from 'react-dom/client';
import App, { setActivityForApp } from '../components/App.js';
import { DiagramTitle } from './DiagramTitle.js';
import LoadActivity from './LoadActivity.js';
import { syncPackagesHash } from './ModuleCache.js';
import { setActivityForRequestCache } from './fetchJSON.js';
import { flash } from './flash.js';

// Used to feature-detect that es6 modules are loading
(window as { indexLoaded?: boolean }).indexLoaded = true;

window.addEventListener('error', err => {
  console.error(err);
  flash(err.message);
});

window.addEventListener('unhandledrejection', err => {
  console.error(err);
  flash(err.reason);
});

window.onload = function () {
  // Make sure module cache is synced with hash param
  syncPackagesHash();

  // Inject LoadActivity dependencies
  const activity = new LoadActivity();
  setActivityForRequestCache(activity);
  setActivityForApp(activity);

  const appEl = document.querySelector('#app') as HTMLDivElement;
  createRoot(appEl).render(<App />);

  const titleEl = document.querySelector('title') as HTMLTitleElement;
  createRoot(titleEl).render(<DiagramTitle defaultTitle={titleEl.innerText} />);
};
