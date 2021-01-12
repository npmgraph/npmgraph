/* global bugsnagClient */

export class HttpError extends Error {
  constructor(code, message = `HTTP Error ${code}`) {
    super(message);
    this.code = code;
  }
}

function _report(severity, err) {
  // HTTP errors are expected (e.g. if 3rd party service is down)
  if (err instanceof HttpError) return;

  bugsnagClient?.notify(err, { severity });
}

export const report = {
  error: _report.bind(null, 'error'),
  warn: _report.bind(null, 'warn'),
  info: _report.bind(null, 'info')
};

const UNITS = [
  [6, 'E'],
  [5, 'P'],
  [4, 'T'],
  [3, 'G'],
  [2, 'M'],
  [1, 'k'],
  [0, ''],
  [-1, 'm'],
  [-2, '\xb5'],
  [-3, 'n'],
  [-4, 'p'],
  [-5, 'f'],
  [-6, 'a']
];

export function human(v, suffix = '', sig = 0) {
  const base = suffix == 'B' ? 1024 : 1000;
  const { pow, log10, floor, round } = Math;
  let exp = floor(log10(v) / log10(base));
  const unit = UNITS.find(([n]) => n <= exp);

  if (!unit) return `0${suffix}`;

  v /= pow(base, unit[0]);
  exp = floor(log10(v)) + 1;
  v = exp < sig ? round(v * pow(10, sig - exp)) / pow(10, sig - exp) : round(v);

  return `${v}${unit[1]}${suffix}`;
}

/**
 * DOM maniulation methods
 */
export function $(...args) {
  const target = args.length == 2 ? args.shift() : document;
  return target ? ElementSet.from(target.querySelectorAll(...args)) : new ElementSet();
}

class ElementSet extends Array {
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

  attr(k, v) {
    if (arguments.length == 1) {
      return this[0]?.getAttribute(k);
    } else if (v === null) {
      this.forEach(el => el.removeAttribute(k));
    } else {
      this.forEach(el => el.setAttribute(k, v));
    }
  }

  get textContent() {
    return this[0]?.textContent;
  }

  set textContent(str) {
    return this.forEach(el => el.textContent = str);
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
      el.appendChild(i > 0 ? nel : nel.cloneNode(true));
    });
  }
}

// Create a new DOM element
$.create = function(name, atts) {
  const el = document.createElement(name);
  if (atts) {
    for (const k in atts) el[k] = atts[k];
  }
  return el;
};

// Find parent or self matching selector (or test function)
$.up = function(el, sel) {
  if (typeof (sel) === 'string') {
    while (el && !el.matches(sel)) el = el.parentElement;
  } else if (typeof (sel) === 'function') {
    while (el && !sel(el)) el = el.parentElement;
  }
  return el;
};

/**
 * Lite class for tracking async activity
 */
export class LoadActivity {
  total = 0;
  active = 0;

  onChange = null;

  get percent() {
    return `${(1 - this.active / this.total) * 100}%`;
  }

  /**
   * Start a loading task
   * @param {String} title of task
   * @returns {Function} function to call when task is complete
   */
  start(title) {
    if (title) this.title = title;
    this.total++;
    this.active++;
    this.onChange?.(this);
    return () => {
      this.active--;
      if (!this.active) {
        this.total = 0;
        this.title = null;
      }
      this.onChange?.(this);
    };
  }
}

/**
 * Wrapper for fetch() that returns JSON response object
 * @param  {...any} args
 */
export function fetchJSON(...args) {
  const p = window.fetch(...args)
    .then(res => {
      if (!res.ok) throw new HttpError(res.status);
      return res.json();
    });

  return p;
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