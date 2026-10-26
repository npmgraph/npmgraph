const CUSTOM_LINKS_ERROR =
  'Each non-empty row must contain a label and a valid HTTP(S) URL separated by a comma.';

type CustomModuleLink = { label: string; href: string };

function encodeTemplateValue(value: string): string {
  return encodeURIComponent(value).replaceAll(/[!'()*]/g, character => {
    const code = {
      '!': '%21',
      "'": '%27',
      '(': '%28',
      ')': '%29',
      '*': '%2A',
    }[character];
    return code ?? character;
  });
}

function expandTemplate(
  template: string,
  name: string,
  version: string,
): string | null {
  const href = template.replaceAll(/\{[^{}]*\}/g, expression => {
    const variable = expression.slice(1, -1);
    return variable === 'name'
      ? encodeTemplateValue(name)
      : variable === 'version'
        ? encodeTemplateValue(version)
        : expression;
  });

  return /[{}]/.test(href) || /%(?![0-9a-f]{2})/i.test(href) ? null : href;
}

function parseCustomModuleLink(
  line: string,
  name: string,
  version: string,
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

  const href = expandTemplate(template, name, version);
  if (!href) {
    return null;
  }

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
    .every(line => parseCustomModuleLink(line, 'package', '1.0.0'))
    ? ''
    : CUSTOM_LINKS_ERROR;
}

export function parseCustomModuleLinks(
  input: string,
  name: string,
  version: string,
) {
  return input.split(/\r?\n/).flatMap(line => {
    const link = parseCustomModuleLink(line, name, version);
    return link === null ? [] : [link];
  });
}
