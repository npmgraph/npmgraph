function describe(reason: unknown) {
  if (reason instanceof Event) {
    const target = reason.target instanceof Element ? reason.target : undefined;
    const src = target?.getAttribute('src') ?? target?.getAttribute('href');
    return `${reason.type} event on <${target?.tagName.toLowerCase() ?? 'unknown'}>${src ? ` (${src})` : ''}`;
  }

  try {
    return JSON.stringify(reason) ?? String(reason);
  } catch {
    return String(reason);
  }
}

// Bugsnag's own handling of non-Error rejections drops most of the detail
export function normalizeRejection(reason: unknown): Error {
  if (reason instanceof Error) {
    return reason;
  }

  const type = Object.prototype.toString.call(reason);
  return new Error(
    `Non-Error promise rejection: ${type} ${describe(reason)}`.slice(0, 500),
    { cause: reason },
  );
}
