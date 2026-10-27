const CUSTOM_LINKS_ERROR =
  'Each non-empty row must contain a label and a valid HTTP(S) URL separated by a comma.';

type LinkMetadata = {
  repository?: string;
  homepage?: string;
};

function parseLine(
  line: string,
  name: string,
  version: string,
  { repository = '', homepage = '' }: LinkMetadata = {},
) {
  const [label = '', ...rest] = line.split(',');

  // Simple variables are percent-encoded; reserved expansion preserves reserved characters.
  const expansions: Record<string, string> = {
    '{name}': encodeURIComponent(name),
    '{+name}': encodeURI(name),
    '{version}': encodeURIComponent(version),
    '{+version}': encodeURI(version),
    '{repository}': repository,
    '{homepage}': homepage,
  };
  const href = rest
    .join(',')
    .trim()
    .replaceAll(
      /\{[^{}]+\}/g,
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
    .every(line =>
      parseLine(line, 'package', '1.0.0', {
        repository: 'https://example.com/repository',
        homepage: 'https://example.com/homepage',
      }),
    )
    ? ''
    : CUSTOM_LINKS_ERROR;
}

export function parseCustomModuleLinks(
  input: string,
  name: string,
  version: string,
  metadata?: LinkMetadata,
) {
  return input
    .split('\n')
    .flatMap(line => parseLine(line, name, version, metadata) ?? []);
}
