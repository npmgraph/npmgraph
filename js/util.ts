import { client } from './bugsnag';

export class HttpError extends Error {
  code: number;

  constructor(code, message = `HTTP Error ${code}`) {
    super(message);
    this.code = code;
  }
}

function _report(severity, err) {
  // HTTP errors are expected (e.g. if 3rd party service is down)
  if (err instanceof HttpError) return;

  client?.notify(err, { severity });
}

export const report = {
  error: _report.bind(null, 'error'),
  warn: _report.bind(null, 'warn'),
  info: _report.bind(null, 'info'),
};

const UNITS: [number, string][] = [
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
  [-6, 'a'],
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
export function $<T extends Element>(...args: [string] | [Element, string]) {
  const target: Element = (
    args.length == 2 ? args.shift() : document
  ) as Element;
  const sel = args[0] as string;
  if (target) {
    const els = target.querySelectorAll<T>(sel);
    return ElementSet.from(els) as unknown as ElementSet<T>;
  } else {
    return new ElementSet<T>();
  }
}

class ElementSet<T extends Element> extends Array<T> {
  on(...args: [string, () => () => void]) {
    const els = [...this];

    for (const el of els) {
      el.addEventListener(...args);
    }

    return function () {
      for (const el of els) {
        el.removeEventListener(...args);
      }
    };
  }

  clear(): void {
    return this.forEach(el => ((el as unknown as HTMLElement).innerText = ''));
  }

  remove(): void {
    return this.forEach(el => el.remove());
  }

  contains(el: T): boolean {
    return this.find(n => n.contains(el)) ? true : false;
  }

  attr(k: string, v?: string) {
    if (arguments.length == 1) {
      return this[0]?.getAttribute(k);
    } else if (v === null) {
      this.forEach(el => el.removeAttribute(k));
    } else {
      this.forEach(el => el.setAttribute(k, v));
    }
  }

  get textContent(): string {
    return this[0]?.textContent;
  }

  set textContent(str) {
    this.forEach(el => (el.textContent = str));
  }

  get innerText(): string {
    return (this[0] as unknown as HTMLElement)?.innerText;
  }

  set innerText(str) {
    this.forEach(el => ((el as unknown as HTMLElement).innerText = str));
  }

  get innerHTML(): string {
    return this[0]?.innerHTML;
  }

  set innerHTML(str) {
    this.forEach(el => (el.innerHTML = str));
  }

  appendChild(nel: Text | Element) {
    if (typeof nel == 'string') nel = document.createTextNode(nel);
    return this.forEach((el, i) => {
      el.appendChild(i > 0 ? nel : nel.cloneNode(true));
    });
  }
}

// Create a new DOM element
$.create = function <T extends HTMLElement>(name: string, atts?: object): T {
  const el = document.createElement(name);
  if (atts) {
    for (const k in atts) el[k] = atts[k];
  }
  return el as T;
};

// Find parent or self matching selector (or test function)
$.up = function <T extends Element>(
  el: Element,
  sel?: string | ((el: Element) => boolean)
): T {
  if (typeof sel === 'string') {
    while (el && !el.matches(sel)) el = el.parentElement;
  } else if (typeof sel === 'function') {
    while (el && !sel(el)) el = el.parentElement;
  }
  return el as T;
};

/**
 * Lite class for tracking async activity
 */
export class LoadActivity {
  title = '';

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

    let _finished = false;
    return () => {
      if (_finished) return;
      _finished = true;
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
export function fetchJSON<T>(...args: [string, RequestInit?]): Promise<T> {
  const p = window.fetch(...args).then(res => {
    if (!res.ok) {
      return Promise.reject(new HttpError(res.status));
    }
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
    if (typeof n == 'number') {
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
