export function cn(
  ...args: Array<string | Record<string, unknown> | undefined>
) {
  const classes = new Set();
  for (const arg of args) {
    if (typeof arg === 'string') {
      for (const className of arg.split(/\s+/)) {
        classes.add(className);
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

  return [...classes].join(' ');
}

export function percent(n: number, precision = 3) {
  return `${(n * 100).toPrecision(precision)}%`;
}

// For values that can't be known at build time (the `style` attribute is not allowed)
export function setStyle(style: Partial<CSSStyleDeclaration>) {
  return (element: HTMLElement | null) => {
    if (element) {
      Object.assign(element.style, style);
    }
  };
}
