import {$} from './util.js';

/**
 * UI widget for showing XHR load progress
 */
export default class Loader {
  constructor(name) {
    this.name = name;
    this.el = document.createElement('div');
    this.el.className = 'loader';
    this.el.innerText = name;
    this.el.insertBefore(document.createElement('span'), this.el.firstChild);
    $('#load').appendChild(this.el);
  }

  start() {
    this.el.classList.add('active');
  }

  stop() {
    this.el.classList.remove('active');
    this.el.classList.add('success');
  }

  error() {
    this.el.classList.remove('active');
    this.el.classList.add('error');
  }
}
