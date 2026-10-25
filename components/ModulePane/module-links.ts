const CUSTOM_LINKS_ERROR =
  'Each non-empty row must contain a label and a valid HTTP(S) URL separated by a comma.';

type CustomModuleLink = { label: string; href: string };

function parseCustomModuleLink(
  line: string,
  packageName: string,
): CustomModuleLink | null {
  const columns: string[] = [];
  let column = '';
  let isQuoted = false;
  let isQuoteClosed = false;

  for (let i = 0; i < line.length; i++) {
    const character = line[i];
    if (character === undefined) {
      continue;
    }

    if (isQuoted) {
      if (character === '"') {
        if (line[i + 1] === '"') {
          column += '"';
          i++;
        } else {
          isQuoted = false;
          isQuoteClosed = true;
        }
      } else {
        column += character;
      }
    } else if (character === '"') {
      if (isQuoteClosed || column.trim()) {
        return null;
      }

      column = '';
      isQuoted = true;
    } else if (character === ',') {
      columns.push(column.trim());
      column = '';
      isQuoteClosed = false;
    } else if (isQuoteClosed) {
      if (!/\s/.test(character)) {
        return null;
      }
    } else {
      column += character;
    }
  }

  if (isQuoted) {
    return null;
  }

  columns.push(column.trim());
  if (columns.length !== 2) {
    return null;
  }

  const label = columns[0];
  const template = columns[1];
  if (!label || !template) {
    return null;
  }

  const href = template.replaceAll(/%[es]/g, placeholder =>
    placeholder === '%s' ? packageName : encodeURIComponent(packageName),
  );

  try {
    const url = new URL(href);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return { label, href: url.href };
    }
  } catch {
    // Invalid custom URLs are ignored.
  }

  return null;
}

export function getCustomModuleLinksError(input: string): string {
  return input
    .split(/\r?\n/)
    .filter(line => line.trim())
    .every(line => parseCustomModuleLink(line, 'package'))
    ? ''
    : CUSTOM_LINKS_ERROR;
}

export function parseCustomModuleLinks(input: string, packageName: string) {
  return input.split(/\r?\n/).flatMap(line => {
    const link = parseCustomModuleLink(line, packageName);
    return link === null ? [] : [link];
  });
}
