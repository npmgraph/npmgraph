import { Manifest, PackageJson } from '@npm/types';
import semverGt from 'semver/functions/gt.js';
import semverSatisfies from 'semver/functions/satisfies.js';
import semverValid from 'semver/functions/valid.js';
import Module, { ModulePackage } from './Module.js';
import fetchJSON from './fetchJSON.js';

const REGISTRY_BASE_URL = 'https://registry.npmjs.org';

const moduleCache = new Map<string, ModuleCacheEntry>();

export type QueryType = 'exact' | 'name' | 'license' | 'maintainer';

type ModuleCacheEntry = {
  promise: Promise<Module>;
  resolve: (module: Module) => void;
  reject: (err: Error) => void;
  module?: Module; // Set once module is loaded
};

function selectVersionFromManifest(
  manifest: Manifest,
  targetVersion: string = 'latest',
): string | undefined {
  // If version matches a dist-tag (e.g. "latest", "best", etc), use that
  const distVersion = manifest['dist-tags']?.[targetVersion];
  if (distVersion) {
    return distVersion;
  }

  // Find highest matching version
  let bestVersion: string | undefined;
  for (const version of Object.keys(manifest.versions)) {
    if (!semverSatisfies(version, targetVersion)) continue;
    if (!bestVersion || semverGt(version, bestVersion ?? '')) {
      bestVersion = version;
    }
  }

  return bestVersion;
}

function validateModuleKey(name: string, version?: string) {
  // "npm:<package name>@<version>"-style names are used to create aliases.  We
  // detect that here and massage the inputs accordingly
  //
  // See `@isaacs/cliui` package for an example.
  if (version?.startsWith('npm:')) {
    name = version.slice(4);
    version = undefined;
    // Important: Fall through so name gets parsed, below...
  }

  if (!version) {
    // Parse versioned-names (e.g. "less@1.2.3")
    [name, version] = Module.unkey(name);
  } else {
    // Remove "git...#" repo URIs from version strings
    const gitless = version?.replace(/git.*#(.*)/, '');
    if (version && gitless !== version) {
      // TODO: Update why this check is needed once we have real-world examples
      console.warn('Found git-based version string');
      version = gitless;
    }
  }

  return [name, version];
}

async function getModuleFromURL(urlString: string) {
  const url = new URL(urlString);

  // TODO: We should probably be fetching github content via their REST API, but
  // that makes this code much more github-specific.  So, for now, we just do
  // some URL-messaging to pull from the "raw" URL
  if (/\.?github.com$/.test(url.host)) {
    url.host = 'raw.githubusercontent.com';
    url.pathname = url.pathname.replace('/blob', '');
  }
  const pkg: PackageJson = await fetchJSON<PackageJson>(url);

  if (!pkg.name) pkg.name = url.toString();

  return new Module(pkg as ModulePackage);
}

async function getModuleFromNPM(
  name: string,
  version?: string,
): Promise<Module> {
  // Non-numeric or ambiguous version need to be resolved.  To do that, we
  // fetch the package's manifest and select the best version.
  if (!semverValid(version)) {
    // Get the manifest. `Accept:` header here lets us get a compact version of
    // the manifest object. See
    // https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md
    const manifest: Manifest = await fetchJSON<Manifest>(
      `${REGISTRY_BASE_URL}/${name}`,
      {
        headers: { Accept: 'application/vnd.npm.install-v1+json' },
      },
    );

    // Match best version from manifest
    version = selectVersionFromManifest(manifest, version);
  }

  if (!version) {
    throw new Error(`Failed to find version`);
  } else if (!semverValid(version)) {
    // This shouldn't happen, but if it does we potentially have an infinite loop ...
    throw new Error(`Non-specific version`);
  }

  // Create module
  const pkg: ModulePackage = await fetchJSON<ModulePackage>(
    `${REGISTRY_BASE_URL}/${name}/${version}`,
  );

  return new Module(pkg);
}

export async function getModule(moduleKey: string): Promise<Module> {
  if (!moduleKey) throw Error('Undefined module name');

  let [name, version] = Module.unkey(moduleKey);
  if (/^https?:\/\//.test(moduleKey)) {
    name = moduleKey;
    version = '';
    // unchanged
  } else {
    [name, version] = validateModuleKey(name, version);
  }

  moduleKey = Module.key(name, version);
  // Check cache once we're done massaging the version string
  const cachedEntry = moduleCache.get(moduleKey);
  if (cachedEntry) {
    return cachedEntry.promise;
  }

  // Set up the cache so subsequent requests for this module will get the same
  // promise object (and thus the same module), even if the module hasn't been
  // loaded yet
  const cacheEntry = {} as ModuleCacheEntry;
  cacheEntry.promise = new Promise<Module>((resolve, reject) => {
    cacheEntry.resolve = resolve;
    cacheEntry.reject = reject;
  });
  moduleCache.set(moduleKey, cacheEntry);

  let promise: Promise<Module>;

  // Fetch module based on type
  if (/^https?:\/\//.test(moduleKey)) {
    promise = getModuleFromURL(moduleKey);
  } else {
    promise = getModuleFromNPM(name, version);
  }
  promise
    .catch(err => {
      return Module.stub(moduleKey, err);
    })
    .then(module => {
      cacheEntry.module = module;

      // Add cache entry for module's computed key
      moduleCache.set(module.key, cacheEntry);
      cacheEntry.resolve(module);
    });

  return cacheEntry.promise;
}

export function getCachedModule(key: string) {
  return moduleCache.get(key)?.module;
}

export function cacheModule(module: Module) {
  const entry = moduleCache.get(module.key);
  if (entry) {
    entry.resolve(module);
  } else {
    moduleCache.set(module.key, {
      promise: Promise.resolve(module),
      module,
      resolve() {},
      reject() {},
    });
  }
}

/**
 * Convenience method for getting loaded modules by some criteria.
 */
export function queryModuleCache(queryType: QueryType, queryValue: string) {
  const results = new Map<string, Module>();

  if (!queryType || !queryValue) return results;

  for (const { module } of moduleCache.values()) {
    if (!module) continue;

    switch (queryType) {
      case 'exact':
        if (module.key === queryValue) results.set(module.key, module);
        break;
      case 'name':
        if (module.name === queryValue) results.set(module.key, module);
        break;
      case 'license':
        if (module.licenseString === queryValue)
          results.set(module.key, module);
        break;
      case 'maintainer':
        if (module.maintainers.find(({ name }) => name === queryValue))
          results.set(module.key, module);
        break;
    }
  }

  return results;
}

const PACKAGE_WHITELIST: (keyof PackageJson)[] = [
  'author',
  'dependencies',
  'devDependencies',
  'license',
  'name',
  'peerDependencies',
  'version',
];

export function sanitizePackageKeys(pkg: PackageJson) {
  const sanitized: PackageJson = {} as PackageJson;
  for (const key of PACKAGE_WHITELIST) {
    if (key in pkg) (sanitized[key] as unknown) = pkg[key];
  }
  return sanitized;
}

export function cacheLocalPackage(pkg: ModulePackage) {
  pkg = sanitizePackageKeys(pkg) as ModulePackage;

  // Construct a local module for the package
  if (!pkg.name) pkg.name = '(upload)';
  if (!pkg.version) {
    // Create version string.  Sadly, there isn't a great semver-compliant
    // scheme out there.  CalVer is a thing but kind of a mess, so I'm using
    // this format, instead: <year>.<dayOfYear>.<secondsOfDay>
    //
    // https://github.com/mahmoud/calver/issues/created_by/broofa
    const now = new Date();
    const year = now.getUTCFullYear();
    let seconds = (Number(now) - Number(new Date(year, 1, 1))) / 1000;
    const dayOfYear = Math.floor(seconds / 86400);
    seconds -= dayOfYear * 86400;
    const version = `${year}.${dayOfYear}.${Math.floor(seconds)}`;

    pkg.version = version;
  }
  pkg._local = true;
  const module = new Module(pkg);

  // Put module in cache and local cache
  cacheModule(module);

  return module;
}
