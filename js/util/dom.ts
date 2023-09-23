import ElementSet from './ElementSet.js';

/**
 * DOM maniulation methods
 */
export default function $<T extends Element>(
  ...args: [string] | [Element, string]
) {
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

// Create a new DOM element
$.create = function <T extends Element>(
  name: string,
  atts?: { [key: string]: unknown },
): T {
  const el = document.createElement(name);
  if (atts) {
    for (const k in atts) el.setAttribute(k, String(atts[k]));
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
