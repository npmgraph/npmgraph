/* global bugsnagClient */

export const report = {
  error(err) {
    bugsnagClient.notify(err, { severity: 'error' });
  },
  warn(err) {
    bugsnagClient.notify(err, { severity: 'warn' });
  },
  info(err) {
    bugsnagClient.notify(err, { severity: 'info' });
  }
};

const UNITS = [
  [18, 'E'],
  [15, 'P'],
  [12, 'T'],
  [9, 'G'],
  [6, 'M'],
  [3, 'k'],
  [0, ''],
  [-3, 'm'],
  [-6, '\xb5'],
  [-9, 'n'],
  [-12, 'p'],
  [-15, 'f'],
  [-18, 'a']
];

export function human(v, suffix = '', sig = 0) {
  const { pow, log10, floor, round } = Math;
  let exp = floor(log10(v));
  const unit = UNITS.find(([n]) => n <= exp);

  if (!unit) return `0${suffix}`;

  v /= pow(10, unit[0]);
  exp = floor(log10(v)) + 1;
  v = exp < sig ? round(v * pow(10, sig - exp)) / pow(10, sig - exp) : round(v);

  return `${v}${unit[1]}${suffix}`;
}

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

  contains(el) {
    return this.find(n => n.contains(el));
  }

  get innerText() {
    return this[0]?.innerText;
  }

  set innerText(str) {
    return this.forEach(el => el.innerText = str);
  }

  get innerHTML() {
    return this[0]?.innerHTML;
  }

  set innerHTML(str) {
    return this.forEach(el => el.innerHTML = str);
  }

  appendChild(nel) {
    if (typeof (nel) == 'string') nel = document.createTextNode(nel);
    return this.forEach((el, i) => {
      if (i > 0) console.log('CLINGINSL');
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
export function ajax(method, url, body) {
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

    if (body && typeof (body) != 'string') {
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(body));
    } else if (body) {
      xhr.send(body);
    } else {
      xhr.send();
    }
  });
}

export function tagify(type = 'tag', tag) {
  return type + '-' + tag.replace(/\W/g, '_').toLowerCase();
}

export function tagElement(el, type, ...tags) {
  tags = tags.map(String); // Stringify all tags
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