export const REPORT_PATH_PREFIX = '/report/';

function encodeReportKey(key: string) {
  // Keep scoped names readable: `@scope/name` instead of `%40scope%2Fname`
  return encodeURIComponent(key)
    .replaceAll('%40', '@')
    .replace(/^(?<scope>@[^%]+)%2F/v, '$<scope>/');
}

/*
Path of the standalone report for the given module keys
*/
export function getReportPath(query: string[]) {
  return REPORT_PATH_PREFIX + query.map(key => encodeReportKey(key)).join(',');
}

/*
Module keys of a standalone report path, or undefined if it's not one
*/
export function parseReportPath(pathname: string) {
  if (!pathname.startsWith(REPORT_PATH_PREFIX)) {
    return undefined;
  }

  let rest = pathname.slice(REPORT_PATH_PREFIX.length).replace(/\/$/v, '');
  try {
    rest = decodeURIComponent(rest);
  } catch {
    // Malformed escape sequence, use the path as is
  }

  const keys = rest
    .split(/\s*,\s*/v)
    .map(key => key.trim())
    .filter(Boolean);
  return keys.length > 0 ? keys : undefined;
}
