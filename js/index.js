import Flash from './Flash.js';
import App from './App.js';
import { init as storeInit } from './Store.js';
import { html, render } from '/vendor/preact.js';

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
  storeInit();
  render(html`<${App} />`, document.body);
};