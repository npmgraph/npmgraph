/* global bugsnagClient */

export const reportError = err => {
  bugsnagClient.notify(err);
};

/**
 * Thin wrapper around querySelector()
 */
export const $ = (...args) => (args[0].querySelector ? args.shift() : document)
  .querySelector(...args);

/**
 * Thin wrapper around querySelectorAll()
 */
export const $$ = (...args) => (args[0].querySelectorAll ? args.shift() : document)
  .querySelectorAll(...args);

/**
 * Like Array#find(), but for DOMElement ancestors
 */
$.up = (el, test) => {
  while (el && !test(el)) el = el.parentElement;
  return el;
};


/**
 * Parse the provided html markup into a document fragment
 */
const _worker = document.createElement('div');
$.parse = markup => {
  _worker.innerHTML = markup;
  const fragment = document.createDocumentFragment();
  [..._worker.childNodes].forEach(el => {
    el.remove();
    fragment.appendChild(el);
  });

  return fragment;
};

/**
 * Simple ajax request support.  Supports different HTTP methods, but (for the
 * moment) does not support sending a request body because we don't (yet) need
 * that feature.
 */
export function ajax(method, url, loader) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState < 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        if (loader) loader.stop();
        resolve(JSON.parse(xhr.responseText));
      } else {
        if (loader) loader.error();
        const err = new Error(`${xhr.status}: ${url}`);
        err.status = xhr.status;
        err.url = url;
        reject(err);
      }
    };

    xhr.open(method, url);
    xhr.send();
  });
}

export const toTag = (type, text) => {
  // .type for license objects
  // .name for maintainer objects
  text = text.type || text.name || text;
  if (!text) {
    reportError(Error(`Undefined tag text (type=${type})`));
    text='__undefined';
  }
  return type + '-' + text.replace(/\W/g, '_').toLowerCase();
};

export const createTag = (type, text, count = 0) => {
  const el = document.createElement('div');

  el.classList.add('tag', type);
  el.dataset.tag = toTag(type, text);
  el.title = el.innerText = count < 2 ? text : `${text}(${count})`;

  return el;
};


export function entryFromKey(key) {
  const MODULE_RE = /^(@?[^@]+)(?:@(.*))?$/;

  if (!MODULE_RE.test(key)) console.log('Invalid key', key);

  return RegExp.$2 ? [RegExp.$1, RegExp.$2] : [RegExp.$1];
}
