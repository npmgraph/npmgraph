import { Manifest, PackageJson } from '@npm/types';
import semverGt from 'semver/functions/gt.js';
import semverSatisfies from 'semver/functions/satisfies.js';
import semverValid from 'semver/functions/valid.js';
import Module, { LOCAL_PREFIX, ModulePackage } from './Module.js';
import fetchJSON from './fetchJSON.js';
import { isDefined } from './guards.js';
import sharedStateHook from './sharedStateHook.js';

const REGISTRY_BASE_URL = 'https://registry.npmjs.org';

const moduleCache = new Map<string, ModuleCacheEntry>();

export type QueryType = 'exact' | 'name' | 'license' | 'maintainer';

type ModuleCacheEntry = {
  promise: Promise<Module>;
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

function validateNPMNameAndVersion(name: string, version?: string) {
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
    const parts = name.match(/(.+)@(.*)/);
    if (parts) {
      name = parts[1];
      version = parts[2];
    }
  } else {
    // Remove "git...#" repo URIs from version strings
    const gitless = version?.replace(/git.*#(.*)/, '');
    if (version && gitless !== version) {
      // TODO: Update why this check is needed once we have real-world examples
      console.warn('Found git-based version string');
      version = gitless;
    }
  }

  return { name, version };
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

export async function getModule(
  name: string,
  version?: string,
): Promise<Module> {
  if (!name) throw Error('Undefined module name');

  // Get cacheKey based on type of module
  let cacheKey: string;
  if (name.startsWith(LOCAL_PREFIX)) {
    cacheKey = Module.key(name, version);
  } else if (/^https?:\/\//.test(name)) {
    cacheKey = Module.key(name, version);
  } else {
    ({ name, version } = validateNPMNameAndVersion(name, version));
    cacheKey = Module.key(name, version);
  }

  // Check cache once we're done massaging the version string
  const cachedEntry = moduleCache.get(cacheKey);
  if (cachedEntry) {
    return cachedEntry.promise;
  }

  // Set up the cache so subsequent requests for this module will get the same
  // promise object (and thus the same module), even if the module hasn't been
  // loaded yet
  const cacheEntry = {} as ModuleCacheEntry;
  moduleCache.set(cacheKey, cacheEntry);

  let promise: Promise<Module>;

  // Fetch module based on type
  if (name.startsWith(LOCAL_PREFIX)) {
    promise = Promise.reject(new Error(`${cacheKey} is not cached`));
    console.warn(`Request for uncached local module`);
    cacheKey = Module.key(name, version);
  } else if (/^https?:\/\//.test(name)) {
    promise = getModuleFromURL(name);
  } else {
    ({ name, version } = validateNPMNameAndVersion(name, version));
    promise = getModuleFromNPM(name, version);
  }

  cacheEntry.promise = promise
    .catch(err => {
      console.warn(`Failed to load module "${cacheKey}": ${err}`);
      return Module.stub(name, version, err);
    })
    .then(module => {
      cacheEntry.module = module;

      // Add cache entry for module's computed key
      moduleCache.set(module.key, cacheEntry);
      return module;
    });

  return cacheEntry.promise;
}

export function getCachedModule(key: string) {
  return moduleCache.get(key)?.module;
}

export function cacheModule(module: Module) {
  moduleCache.set(module.key, { promise: Promise.resolve(module), module });
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

//
// Local storage cache for modules
//

export const [useLocalModules, setLocalModules] = sharedStateHook<Module[]>(
  [],
  'localModules',
);

function _updateLocalModules() {
  const localModules = getLocalModuleNames()
    .sort()
    .map(getCachedModule)
    .filter(isDefined);
  setLocalModules(localModules);
}

export function getLocalModuleNames() {
  return Object.keys(window.sessionStorage);
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

function sanitizePackage(pkg: PackageJson) {
  const sanitized: PackageJson = {} as PackageJson;
  for (const key of PACKAGE_WHITELIST) {
    if (key in pkg) (sanitized[key] as unknown) = pkg[key];
  }
  return sanitized;
}

// TODO: Use this instead of
export function cacheLocalPackage(pkg: ModulePackage) {
  pkg = sanitizePackage(pkg) as ModulePackage;

  // Construct a local module for the package
  if (!pkg.name) pkg.name = '(upload)';
  if (!pkg.version) {
    // Make semver string of form YYYY.MM.DD-HH:MM:SS.ddd
    pkg.version = new Date().toISOString().replace(/-/g, '.').replace('T', '-');
  }
  pkg._local = true;
  const module = new Module(pkg);

  // Put module in cache and local cache
  cacheModule(module);

  // Store in sessionStorage
  window.sessionStorage.setItem(module.key, JSON.stringify(module.package));
  _updateLocalModules();

  return module;
}

export function uncacheModule(moduleKey: string) {
  moduleCache.delete(moduleKey);
  window.sessionStorage.removeItem(moduleKey);
  _updateLocalModules();
}

export function loadLocalModules() {
  // Reconstitute [uploaded] modules from sessionStorage
  const { sessionStorage } = window;

  // Pull in user-supplied package.json files that may have been stored in sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    const moduleKey = sessionStorage.key(i);
    if (!moduleKey?.startsWith(LOCAL_PREFIX)) continue;

    try {
      const packageJson = sessionStorage.getItem(moduleKey);
      const pkg: ModulePackage = packageJson && JSON.parse(packageJson);
      const module = new Module(pkg);
      cacheModule(module);
      _updateLocalModules();
    } catch (err) {
      console.error(err);
    }
  }
}
