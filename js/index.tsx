import './util/bugsnag.js'; // Initialize ASAP!

import React from 'react';
import { createRoot } from 'react-dom/client';
import App, { setActivityForApp } from './App.js';
import { Flash } from './components/Flash.js';
import LoadActivity from './util/LoadActivity.js';
import { loadLocalModules } from './util/ModuleRegistry.js';
import { setActivityForRequestCache } from './util/fetchJSON.js';

// Used to feature-detect that es6 modules are loading
(window as { indexLoaded?: boolean }).indexLoaded = true;

window.addEventListener('error', err => {
  console.error(err);
  Flash(err.message);
});

window.addEventListener('unhandledrejection', err => {
  console.error(err);
  Flash(err.reason);
});

window.onload = function () {
  // Inject LoadActivity dependencies
  const activity = new LoadActivity();
  setActivityForRequestCache(activity);
  setActivityForApp(activity);
  loadLocalModules();

  const root = createRoot(document.querySelector('#app') as HTMLDivElement);
  root.render(<App />);
};
