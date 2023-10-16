export function isHttpModule(moduleKey: string) {
  return /^https?:\/\//.test(moduleKey);
}

export function resolveModule(name: string, version?: string) {
  // "npm:<package name>@<version>"-style names are used to create aliases.  We
  // detect that here and massage the inputs accordingly
  //
  // See `@isaacs/cliui` package for an example.
  if (version?.startsWith('npm:')) {
    name = version.slice(4);
    version = undefined;
    // Important: Fall through so name is parsed, below...
  }

  if (!version) {
    // Parse versioned-names (e.g. "less@1.2.3")
    [name, version] = parseModuleKey(name);
  } else {
    // Remove "git...#" repo URIs from version strings
    const gitless = version?.replace(/git.*#(.*)/, '');
    if (version && gitless !== version) {
      // TODO: Update why this check is needed once we have real-world examples
      console.warn('Found git-based version string');
      version = gitless;
    }
  }

  return [name, version] as const;
}

export function getModuleKey(name: string, version: string) {
  return version ? `${name}@${version}` : name;
}

export function parseModuleKey(moduleKey: string): string[] {
  const parts = moduleKey.match(/(.+)@(.*)/);
  if (!parts) return [moduleKey];

  parts.shift(); // remove full match
  return parts; // [name, version]
}
