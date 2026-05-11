import type { PackumentVersion } from '@npm/types';
import type { Dependencies } from './Module.ts';

export function isHttpModule(moduleKey: string) {
  return /^https?:\/\//.test(moduleKey);
}

export function resolveModule(name: string, version?: string) {
  if (version) {
    // Remove "git...#" repo URIs from version strings
    const gitless = version?.replace(/git.*#(.*)/v, '');
    if (version && gitless !== version) {
      // TODO: Update why this check is needed once we have real-world examples
      console.warn('Found git-based version string');
      version = gitless;
    }
  } else {
    // Parse versioned-names (e.g. "less@1.2.3")
    [name, version] = parseModuleKey(name);
  }

  return [name, version] as const;
}

export function getModuleKey(name: string, version: string) {
  return version ? `${name}@${version}` : name;
}

export function parseModuleKey(moduleKey: string): string[] {
  const parts = moduleKey.match(/(.+)@(.*)/v);
  if (!parts) return [moduleKey];

  parts.shift(); // Remove full match
  return parts; // [name, version]
}

const ALIAS_RE = /npm:(?<name>@?[^@]+)@(?<semver>.+)/v;

export function resolveDependencyAliases(pkg: PackumentVersion) {
  for (const depType of [
    'dependencies',
    'devDependencies',
    'peerDependencies',
  ]) {
    const deps = pkg[depType as keyof PackumentVersion] as Dependencies;
    if (!deps) {
      continue;
    } else if (deps.constructor !== Object) {
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
      if (match) {
        console.log(
          `Resolving alias ${name} -> ${match.groups!.name}@${match.groups!.semver}`,
        );
        delete deps[name];
        deps[match.groups!.name] = match.groups!.semver;
      }
    }
  }

  return pkg;
}
