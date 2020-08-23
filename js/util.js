/* global bugsnagClient */

export const report = {
  error: err => bugsnagClient.notify(err, { severity: 'error' }),
  warn: err => bugsnagClient.notify(err, { severity: 'warn' }),
  info: err => bugsnagClient.notify(err, { severity: 'info' })
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
export function ajax(method, url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState < 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
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

export function tagify(type, tag) {
  return type + '-' + tag.replace(/\W/g, '_').toLowerCase();
}

export function tagElement(el, type, ...tags) {
  tags = tags.filter(t => t).map(t => tagify(type, t));
  el.classList.add(...tags);
}

export function createTag(type, text, count = 0) {
  const el = document.createElement('div');

  el.classList.add('tag', type);
  el.dataset.tag = tagify(type, text);
  el.title = el.innerText = count < 2 ? text : `${text}(${count})`;

  return el;
}

export function entryFromKey(key) {
  const MODULE_RE = /^(@?[^@]+)(?:@(.*))?$/;

  if (!MODULE_RE.test(key)) console.log('Invalid key', key);

  return RegExp.$2 ? [RegExp.$1, RegExp.$2] : [RegExp.$1];
}

export function getDependencyEntries(pkg, level = 0) {
  pkg = pkg.package || pkg;

  const deps = [];

  for (const el of $$('.depInclude input')) {
    const { type } = el.dataset;
    if (!pkg[type]) continue;
    if (!el.checked) continue;
    if (level > 0 && type != 'dependencies') continue;

    // Get entries, adding type to each entry
    const d = Object.entries(pkg[type]);
    d.forEach(o => o.push(type));
    deps.push(...d);
  }

  return deps;
}

export function simplur(strings, ...exps) {
  const result = [];
  let n = exps[0];
  let label = n;
  if (Array.isArray(n) && n.length == 2) [n, label] = n;
  for (const s of strings) {
    if (typeof (n) == 'number') {
      result.push(s.replace(/\[([^|]*)\|([^\]]*)\]/g, n == 1 ? '$1' : '$2'));
    } else {
      result.push(s);
    }

    if (!exps.length) break;
    n = label = exps.shift();
    if (Array.isArray(n) && n.length == 2) [n, label] = n;
    result.push(label);
  }

  return result.join('');
}