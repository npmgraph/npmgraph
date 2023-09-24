import { Manifest } from '@npm/types';
import semverGt from 'semver/functions/gt.js';
import semverSatisfies from 'semver/functions/satisfies.js';
import semverValid from 'semver/functions/valid.js';
import Module, { ModulePackage } from './Module.js';
import fetchJSON from './fetchJSON.js';

const REGISTRY_BASE_URL = 'https://registry.npmjs.org';

const moduleCache = new Map<string, ModuleCacheEntry>();

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

function validateNameAndVersion(name: string, version?: string) {
  if (name.startsWith('local:')) {
    return { name, version };
  }

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

export async function getModule(
  name: string,
  version?: string,
): Promise<Module> {
  if (!name) throw Error('Undefined module name');

  ({ name, version } = validateNameAndVersion(name, version));

  const cacheKey = Module.key(name, version);

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

  // Create promise that hydrates the module
  //
  // Using an async-IIEF here allows us to build the promise using the syntactic
  // sugar of async/await
  cacheEntry.promise = (async function () {
    // Helper to do the stuff we need to do when a module fails to load
    function fail(err: unknown) {
      const module = Module.stub(
        name,
        version,
        err instanceof Error ? err : new Error(String(err)),
      );

      console.warn(`Failed to load module "${cacheKey}": ${err}`);

      cacheEntry.promise = Promise.resolve(module);
      cacheEntry.module = module;

      return module;
    }

    // Non-numeric or ambiguous version need to be resolved.  To do that, we
    // fetch the package's manifest and select the best version.
    if (!semverValid(version)) {
      // Get the manifest
      let manifest: Manifest;
      try {
        // `Accept:` header here lets us get a compact version of the manifest
        // object. See
        // https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md
        manifest = await fetchJSON<Manifest>(`${REGISTRY_BASE_URL}/${name}`, {
          headers: { Accept: 'application/vnd.npm.install-v1+json' },
        });
      } catch (err) {
        return fail(err);
      }

      // Match best version from manifest
      version = selectVersionFromManifest(manifest, version);
    }

    if (!version) {
      return fail(`Failed to find version for "${cacheKey}"`);
    } else if (!semverValid(version)) {
      // This shouldn't happen, but if it does we potentially have an infinite loop ...
      return fail(`Non-specific version for "${cacheKey}"`);
    }

    // Create module
    let pkg: ModulePackage;
    try {
      pkg = await fetchJSON<ModulePackage>(
        `${REGISTRY_BASE_URL}/${name}/${version}`,
      );
    } catch (err) {
      return fail(err);
    }

    // Expose module on cache entry
    cacheEntry.module = new Module(pkg);

    // ... and provide cache key for exact version (used by UI when user clicks
    // on modules in graph, where the exact version is always shown)
    moduleCache.set(cacheEntry.module.key, cacheEntry);

    return cacheEntry.module;
  })();

  return cacheEntry.promise;
}

export function getCachedModule(key: string) {
  return moduleCache.get(key)?.module;
}

export function cacheModule(module: Module) {
  moduleCache.set(module.key, { promise: Promise.resolve(module), module });
}

//
// Local storage cache for modules
//

export function getLocalModuleNames() {
  return Object.keys(window.sessionStorage);
}

export function cacheLocalModule(module: Module) {
  // Store in sessionStorage
  window.sessionStorage.setItem(module.key, JSON.stringify(module.package));
}

export function loadLocalModules() {
  // Reconstitute [uploaded] modules from sessionStorage
  const { sessionStorage } = window;

  // Pull in user-supplied package.json files that may have been stored in sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    const moduleKey = sessionStorage.key(i);
    if (!moduleKey?.startsWith('local:')) continue;

    try {
      const packageJson = sessionStorage.getItem(moduleKey);
      const pkg: ModulePackage = packageJson && JSON.parse(packageJson);
      const module = new Module(pkg);
      cacheModule(module);
    } catch (err) {
      console.error(err);
    }
  }
}
