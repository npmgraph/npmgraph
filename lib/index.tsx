import './bugsnag.js'; // Initialize ASAP!

import React from 'react';
import { createRoot } from 'react-dom/client';
import App, { setActivityForApp } from '../components/App.js';
import LoadActivity from './LoadActivity.js';
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
  // Inject LoadActivity dependencies
  const activity = new LoadActivity();
  setActivityForRequestCache(activity);
  setActivityForApp(activity);

  const root = createRoot(document.querySelector('#app') as HTMLDivElement);
  root.render(<App />);
};
