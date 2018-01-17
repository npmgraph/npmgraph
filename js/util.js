'use strict';

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
 * Simple ajax request support.  Supports different HTTP methods, but (for the
 * moment) does not support sending a request body because we don't (yet) need
 * that feature.
 */
export async function ajax(method, url, loader) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState < 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        if (loader) loader.stop();
        resolve(JSON.parse(xhr.responseText));
      } else {
        if (loader) loader.error();
        reject(xhr.status);
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

  return type + '-' + text.replace(/\W/g, '_').toLowerCase();
};

export const toLicense = pkg => {
  const license = Array.isArray(pkg.licenses) ? pkg.licenses[0] : pkg.license;
  return (license && license.type) || license || 'None'
};

export const renderTag = (type, text, count = 0) => {
  const tag = toTag(type, text);
  text = count < 2 ? text : `${text}(${count})`;

  return `<span class="tag ${type}" data-tag="${tag}">${text}</span>`;
};
export const renderMaintainer = (maintainer, count) => renderTag('maintainer', maintainer, count);
export const renderLicense = (license, count) => renderTag('license', license, count);
export const renderModule = (name, count) => renderTag('module', name, count);

