export class HttpError extends Error {
  code: number;

  constructor(code: number, message = `HTTP Error ${code}`) {
    super(message);
    this.code = code;
  }
}

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

export function human(v: number, suffix = '', sig = 0) {
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
    } else if (v == null) {
      this.forEach(el => el.removeAttribute(k));
    } else {
      this.forEach(el => el.setAttribute(k, v));
    }
  }

  get textContent(): string {
    return this[0]?.textContent ?? '';
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
$.create = function <T extends Element>(
  name: string,
  atts?: { [key: string]: any },
): T {
  const el = document.createElement(name);
  if (atts) {
    for (const k in atts) el.setAttribute(k, atts[k]);
  }
  return el as unknown as T;
};

// Find parent or self matching selector (or test function)
$.up = function <T extends Element>(
  el: Element,
  sel?: string | ((el: Element) => boolean),
) {
  let trace: Element | null = el;
  if (typeof sel === 'string') {
    while (trace && !trace.matches(sel)) trace = trace.parentElement;
  } else if (typeof sel === 'function') {
    while (trace && !sel(trace)) trace = trace.parentElement;
  }
  return trace ? (trace as T) : undefined;
};

type LoadActivityFn = (la: LoadActivity) => void;

/**
 * Lite class for tracking async activity
 */
export class LoadActivity {
  title: string | null = '';

  total = 0;
  active = 0;
  onChange: LoadActivityFn | null = null;

  get percent() {
    return `${(1 - this.active / this.total) * 100}%`;
  }

  start(title: string): () => void {
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

export function tagify(type = 'tag', tag: string) {
  return type + '-' + tag.replace(/\W/g, '_').toLowerCase();
}

export function tagElement(
  el: Element,
  type: string,
  ...tags: (string | undefined)[]
) {
  for (const tag of tags) {
    if (tag) el.classList.add(tagify(type, tag));
  }
}

export function createTag(type: string, text: string, count = 0) {
  const el = $.create<HTMLDivElement>('div');

  el.classList.add('tag', type);
  el.dataset.tag = tagify(type, text);
  el.title = el.innerText = count < 2 ? text : `${text}(${count})`;

  return el;
}

export function simplur(strings: TemplateStringsArray, ...exps: unknown[]) {
  const result: string[] = [];
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
    result.push(String(label));
  }

  return result.join('');
}

export function isPromise<T>(obj: Promise<T> | T): obj is Promise<T> {
  return obj instanceof Promise;
}
