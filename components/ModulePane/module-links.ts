const CUSTOM_LINKS_ERROR =
  'Each non-empty row must contain a label and a valid HTTP(S) URL separated by a comma.';

function parseLine(line: string, name: string, version: string) {
  const [label = '', ...rest] = line.split(',');

  // {name} and {version} are percent-encoded; {+name} and {+version} keep reserved characters
  const expansions: Record<string, string> = {
    '{name}': encodeURIComponent(name),
    '{+name}': encodeURI(name),
    '{version}': encodeURIComponent(version),
    '{+version}': encodeURI(version),
  };
  const href = rest
    .join(',')
    .trim()
    .replaceAll(
      /\{\+?(?:name|version)\}/g,
      expression => expansions[expression] ?? expression,
    );
  const url = URL.parse(href);

  if (
    url &&
    label.trim() &&
    /^https?:$/.test(url.protocol) &&
    !/[{}]/.test(href)
  ) {
    return { label: label.trim(), href: url.href };
  }

  return undefined;
}

export function getCustomModuleLinksError(input: string) {
  return input
    .split('\n')
    .filter(line => line.trim())
    .every(line => parseLine(line, 'package', '1.0.0'))
    ? ''
    : CUSTOM_LINKS_ERROR;
}

export function parseCustomModuleLinks(
  input: string,
  name: string,
  version: string,
) {
  return input
    .split('\n')
    .flatMap(line => parseLine(line, name, version) ?? []);
}
