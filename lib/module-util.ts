import type { PackumentVersion } from '@npm/types';
import hostedGitInfo from 'hosted-git-info';

type Dependencies = PackumentVersion['dependencies'];

export function isHttpModule(moduleKey: string) {
  return /^https?:\/\//.test(moduleKey);
}

/**
 Like npm-cli, `user/repo` is a GitHub repo. Package names can't contain a slash
 unless they're scoped (`@scope/name`), so this isn't ambiguous.
 */
export function resolveGitHubShorthand(moduleKey: string) {
  // Only resolve bare user/repo shorthand, not package names or URLs.
  if (!/^[\w-]+\/[\w\-.]+$/.test(moduleKey)) {
    return moduleKey;
  }

  const info = hostedGitInfo.fromUrl(`github:${moduleKey}`);

  return (info?.type === 'github' && info.file('package.json')) || moduleKey;
}

export function resolveModule(name: string, version?: string) {
  if (version) {
    // Remove "git...#" repo URIs from version strings
    const gitless = version?.replace(/git.*#.*/v, '');
    if (version && gitless !== version) {
      // TODO: Update why this check is needed once we have real-world examples
      console.warn('Found git-based version string');
      version = gitless;
    }
  } else {
    // Parse versioned-names (e.g. "less@1.2.3")
    [name, version] = parseModuleKey(name) as [string, string];
  }

  return [name, version] as const;
}

export function getModuleKey(name: string, version: string) {
  return version ? `${name}@${version}` : name;
}

export function parseModuleKey(moduleKey: string): string[] {
  const match = /(?<name>.+)@(?<version>.*)/v.exec(moduleKey);
  return match
    ? [match.groups!['name']!, match.groups!['version']!]
    : [moduleKey];
}

const ALIAS_RE = /npm:(?<name>@?[^@]+)@(?<semver>.+)/v;

/**
Resolve a dependency to its real name and range, following npm: aliases
*/
export function resolveAlias(name: string, version: string) {
  const groups = ALIAS_RE.exec(version)?.groups;
  return [groups?.['name'] ?? name, groups?.['semver'] ?? version] as const;
}

export function resolveDependencyAliases(pkg: PackumentVersion) {
  for (const depType of [
    'dependencies',
    'devDependencies',
    'peerDependencies',
  ]) {
    const deps = pkg[depType as keyof PackumentVersion] as Dependencies;
    if (!deps) {
      continue;
    }

    if (deps.constructor !== Object) {
      console.warn('Unexpected dependency object shape', {
        depType,
        moduleName: pkg.name,
        moduleVersion: pkg.version,
        valueType: typeof deps,
      });
      continue;
    }

    for (const [name, version] of Object.entries(deps)) {
      // Dereference npm:-prefixed aliases
      const match = ALIAS_RE.exec(version);
      if (!match) {
        continue;
      }

      const groupName = match.groups!['name'];

      // Leave aliases that would replace another dependency as-is, e.g.
      // "foo": "^2" next to "foo-1": "npm:foo@^1". See resolveAlias()
      if (groupName !== name && groupName && Object.hasOwn(deps, groupName)) {
        continue;
      }

      console.log(
        `Resolving alias ${name} -> ${match.groups!['name']}@${match.groups!['semver']}`,
      );
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- Comes from Object.entries()
      delete deps[name];
      const groupSemver = match.groups!['semver'];
      if (groupName && groupSemver) {
        deps[groupName] = groupSemver;
      }
    }
  }

  return pkg;
}
