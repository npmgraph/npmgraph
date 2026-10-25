export function parseCustomModuleLinks(input: string, moduleKey: string) {
  const links: Array<{ label: string; href: string }> = [];
  for (const line of input.split(/\r?\n/)) {
    let isQuoted = false;
    let delimiterIndex = -1;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        if (isQuoted && line[i + 1] === '"') {
          i++;
        } else {
          isQuoted = !isQuoted;
        }
      } else if (!isQuoted && (line[i] === ',' || line[i] === ':')) {
        delimiterIndex = i;
        break;
      }
    }

    if (delimiterIndex < 1) {
      continue;
    }

    const unquote = (value: string) => {
      const trimmed = value.trim();
      return trimmed.startsWith('"') && trimmed.endsWith('"')
        ? trimmed.slice(1, -1).replaceAll('""', '"').trim()
        : trimmed;
    };

    const label = unquote(line.slice(0, delimiterIndex));
    const template = unquote(line.slice(delimiterIndex + 1));
    if (!label || !template) {
      continue;
    }

    const href = template.replaceAll(/%[es]/g, placeholder =>
      placeholder === '%s' ? moduleKey : encodeURIComponent(moduleKey),
    );

    try {
      const url = new URL(href);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        links.push({ label, href: url.href });
      }
    } catch {
      // Invalid custom URLs are ignored.
    }
  }

  return links;
}
