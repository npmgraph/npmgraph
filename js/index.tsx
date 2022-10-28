import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './bugsnag'; // Initialize ASAP!
import { Flash } from './Components';

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
  const root = createRoot(document.querySelector('#app'));
  root.render(<App />);
};
