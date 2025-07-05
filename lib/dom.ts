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

export function percent(n: number, precision = 3) {
  return `${(n * 100).toPrecision(precision)}%`;
}
