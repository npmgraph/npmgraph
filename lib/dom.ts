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
$.create = <T extends Element>(
  name: string,
  atts?: { [key: string]: unknown },
): T => {
  const el = document.createElement(name);
  if (atts) {
    for (const k in atts) el.setAttribute(k, String(atts[k]));
  }
  return el as unknown as T;
};

// Find parent or self matching selector (or test function)
$.up = <T extends Element>(
  el: Element,
  sel?: string | ((el: Element) => boolean),
) => {
  let trace: Element | null = el;
  if (typeof sel === 'string') {
    while (trace && !trace.matches(sel)) trace = trace.parentElement;
  } else if (typeof sel === 'function') {
    while (trace && !sel(trace)) trace = trace.parentElement;
  }
  return trace ? (trace as T) : undefined;
};

export function cn(...args: (string | object | undefined)[]) {
  const classes = new Set();
  for (const arg of args) {
    if (!arg) {
      continue;
    } else if (typeof arg === 'string') {
      for (const cn of arg.split(/\s+/g)) {
        classes.add(cn);
      }
    } else if (typeof arg === 'object') {
      for (const [k, v] of Object.entries(arg)) {
        if (v) {
          classes.add(k);
        } else {
          classes.delete(k);
        }
      }
    }
  }

  return Array.from(classes).join(' ');
}
