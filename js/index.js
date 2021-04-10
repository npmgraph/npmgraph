import React from 'react';
import { render } from 'react-dom';
import App from './App';

import { Flash } from './Components.js';

// Used to feature-detect that es6 modules are loading
window.indexLoaded = true;

window.addEventListener('error', err => {
  console.error(err);
  Flash(err.message);
});

window.addEventListener('unhandledrejection', err => {
  console.error(err);
  Flash(err.reason);
});

window.onload = function() {
  render(<App />, document.querySelector('#app'));
};
