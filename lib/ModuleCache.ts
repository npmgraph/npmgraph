import { PackageJson, Packument, PackumentVersion } from '@npm/types';
import semverGt from 'semver/functions/gt.js';
import semverSatisfies from 'semver/functions/satisfies.js';
import HttpError from './HttpError.js';
import Module, { ModulePackage } from './Module.js';
import PromiseWithResolvers, {
  PromiseWithResolversType,
} from './PromiseWithResolvers.js';
import URLPlus from './URLPlus.js';
import { PARAM_PACKAGES } from './constants.js';
import fetchJSON from './fetchJSON.js';
import { flash } from './flash.js';
import {
  getModuleKey,
  isHttpModule,
  parseModuleKey,
  resolveModule,
} from './module_util.js';

const REGISTRY_BASE_URL = 'https://registry.npmjs.org';

const moduleCache = new Map<string, ModuleCacheEntry>();

export type QueryType = 'exact' | 'name' | 'license' | 'maintainer';

type ModuleCacheEntry = PromiseWithResolversType<Module> & {
  module?: Module; // Set once module is loaded
};

function selectVersion(
  packument: Packument,
  targetVersion: string = 'latest',
): PackumentVersion | undefined {
  let selectedVersion: string | undefined;

  // If version matches a dist-tag (e.g. "latest", "best", etc), use that
  const distVersion = packument['dist-tags']?.[targetVersion];
  if (distVersion) {
    selectedVersion = distVersion;
  } else {
    // Find highest matching version
    for (const version of Object.keys(packument.versions)) {
      if (!semverSatisfies(version, targetVersion)) continue;
      if (!selectedVersion || semverGt(version, selectedVersion)) {
        selectedVersion = version;
      }
    }
  }

  return packument.versions[selectedVersion ?? ''];
}

async function fetchModuleFromNPM(
  moduleName: string,
  version?: string,
): Promise<Module> {
  const packument = await fetchNPMPackument(moduleName);

  // Match best version from manifest
  const packumentVersion = packument && selectVersion(packument, version);

  if (!packumentVersion) {
    throw new Error(`${moduleName} does not have a version ${version}`);
  }

  return new Module(packumentVersion, packument);
}

async function fetchModuleFromURL(urlString: string) {
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

export async function fetchNPMPackument(moduleName: string) {
  const packument = await fetchJSON<Packument>(
    `${REGISTRY_BASE_URL}/${moduleName}`,
    {
      // Per
      // https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md
      // we should arguably be using the 'Accept:
      // application/vnd.npm.install-v1+json' header to reduce the request size.
      // But that doesn't actually work.
      //
      // REF: https://github.com/npm/feedback/discussions/1014
      //
      // So instead we're sending 'application/json'.  The responses are smaller
      // and we get full "version" objects, so we don't have to send follow-up
      // requests.
      headers: { Accept: 'application/json' },
    },
  );

  return packument;
}

// Note: This method should not throw!  Errors should be returned as part of a
// stub module
export async function getModule(moduleKey: string): Promise<Module> {
  if (!moduleKey) throw Error('Undefined module name');

  let [name, version] = parseModuleKey(moduleKey);

  if (isHttpModule(moduleKey)) {
    name = moduleKey;
    version = '';
    // unchanged
  } else {
    [name, version] = resolveModule(name, version);
  }

  moduleKey = getModuleKey(name, version);
  // Check cache once we're done massaging the version string
  const cachedEntry = moduleCache.get(moduleKey);
  if (cachedEntry) {
    return cachedEntry.promise;
  }

  // Set up the cache so subsequent requests for this module will get the same
  // promise object (and thus the same module), even if the module hasn't been
  // loaded yet
  const cacheEntry = PromiseWithResolvers<Module>() as ModuleCacheEntry;
  moduleCache.set(moduleKey, cacheEntry);

  let promise: Promise<Module>;

  // Fetch module based on type
  if (isHttpModule(moduleKey)) {
    promise = fetchModuleFromURL(moduleKey);
  } else {
    promise = fetchModuleFromNPM(name, version);
  }
  promise
    .catch(err => {
      if (err instanceof HttpError) {
        err.message = `Fetch failed for ${moduleKey} (code = ${err.code})`;
      }

      return Module.stub(moduleKey, err);
    })
    .then(module => {
      cacheEntry.module = module;

      // Add cache entry for module's computed key
      moduleCache.set(module.key, cacheEntry);

      // Resolve promise
      cacheEntry.resolve(module);
    });

  return cacheEntry.promise;
}

export function getCachedModule(key: string) {
  return moduleCache.get(key)?.module;
}

export function cacheModule(module: Module) {
  const moduleKey = module.key;
  const entry = moduleCache.get(moduleKey);

  if (entry) {
    entry.resolve(module);
  } else {
    moduleCache.set(moduleKey, {
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

function sanitizePackageKeys(pkg: PackageJson) {
  const sanitized: PackageJson = {} as PackageJson;
  for (const key of PACKAGE_WHITELIST) {
    if (key in pkg) (sanitized[key] as unknown) = pkg[key];
  }
  return sanitized;
}

export function cacheLocalPackage(pkg: ModulePackage) {
  pkg = sanitizePackageKeys(pkg) as ModulePackage;

  pkg._local = true;

  const module = new Module(pkg);

  // Put module in cache and local cache
  cacheModule(module);

  return module;
}

let lastPackagesVal: string | null;

// Make sure any packages in the URL hash are loaded into the module cache
export function syncPackagesHash() {
  const url = new URLPlus(window.location.href);
  const packagesJson = url.getHashParam(PARAM_PACKAGES);

  // If the hash param hasn't changed, there's nothing to do
  if (lastPackagesVal === packagesJson) return;
  lastPackagesVal = packagesJson;

  if (!packagesJson) return;

  let packages: PackageJson[];
  try {
    packages = JSON.parse(packagesJson);
  } catch (err) {
    flash('"packages" hash param is not valid JSON');
    return;
  }

  for (const pkg of packages) {
    cacheLocalPackage(pkg as ModulePackage);
  }
}
