/* global bugsnagClient */

export const report = {
  error: err => bugsnagClient.notify(err, { severity: 'error' }),
  warn: err => bugsnagClient.notify(err, { severity: 'warn' }),
  info: err => bugsnagClient.notify(err, { severity: 'info' })
};

/**
 * DOM maniulation methods
 */
export function $(...args) {
  const target = args.length == 2 ? args.shift() : document;
  return ElementSet.from(target.querySelectorAll(...args));
}

class ElementSet extends Array {
  get element() {
    return this[0];
  }

  forEach(...args) {
    super.forEach(...args);
    return this;
  }

  on(...args) {
    const els = [...this];

    for (const el of els) {
      el.addEventListener(...args);
    }

    return function() {
      for (const el of els) {
        el.removeEventListener(...args);
      }
    };
  }

  clear() {
    return this.forEach(el => (el.innerText = ''));
  }

  remove() {
    return this.forEach(el => el.remove());
  }

  get innerText() {
    return this.element.innerText;
  }

  set innerText(str) {
    return this.forEach(el => el.innerText = str);
  }

  get innerHTML() {
    return this.element.innerHTML;
  }

  set innerHTML(str) {
    return this.forEach(el => el.innerHTML = str);
  }

  appendChild(nel) {
    if (typeof (nel) == 'string') nel = document.createTextNode(nel);
    return this.forEach((el, i) => {
      el.appendChild(i > 0 ? nel : nel.cloneNode(true));
    });
  }
}

// Create a new DOM element
$.create = function(name, atts) {
  const el = document.createElement(name);
  if (atts) {
    for (const k in Object.getOwnPropertyNames(atts)) {
      el[k] = atts[k];
    }
  }
  return el;
};

// Find parent (using optional test function)
$.up = function(el, test) {
  while (el && !test(el)) el = el.parentElement;
  return el;
};

// Find all elements matching selector
$.all = function(...args) {
  return (args[0].querySelectorAll ? args.shift() : document)
    .querySelectorAll(...args);
};

// Parse HTML into document fragment
$.parse = function(markup) {
  if (!this._worker) this._worker = document.createElement('div');

  this._worker.innerHTML = markup;
  const fragment = document.createDocumentFragment();
  [...this._worker.childNodes].forEach(el => {
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
  const el = $.create('div');

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

export function getDependencyEntries(pkg, depIncludes, level = 0) {
  pkg = pkg.package || pkg;

  const deps = [];

  for (const type of depIncludes) {
    if (!pkg[type]) continue;

    // Only do one level for non-"dependencies"
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

export function prettyStringify(val, _tagName = 'span') {
  let type = typeof (val);
  if (val === null) type = 'null';
  if (Array.isArray(val)) type = 'array';
  switch (type) {
    case 'undefined':
      return;

    case 'array': {
      const doc = document.createDocumentFragment();

      const ol = $.create('ol', { class: 'json-array' });
      val.forEach((v, i, arr) => {
        const el = prettyStringify(v);
        if (!el) return;
        const li = $.create('li');
        $.append(li, el, i != arr.length - 1 ? ',' : '');
        ol.append(li);
      });

      $.append(doc, '[', ol, ']');

      return doc;
    }

    case 'object': {
      const doc = document.createDocumentFragment();

      const ul = $.create('ul', { class: 'json-object' });
      Object.entries(val).forEach(([k, val], i, arr) => {
        const el = prettyStringify(val);
        if (!el) return;

        const li = $.create('li');
        $.append(li,
          $.create('span', { className: 'json-key', innerText: k }),
          ':',
          el,
          i != arr.length ? ',' : ''
        );
        if (i != arr.length - 1) $.append(li, ',');
        ul.append(li);
      });

      $.append(doc, '{', ul, '}');

      return doc;
    }

    default:
      return $.create(_tagName, {
        className: `json-${type}`,
        innerText: JSON.stringify(val)
      });
  }
}