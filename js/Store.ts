import semver from 'semver';
import Module, { moduleKey } from './Module.js';
import { ModulePackage } from './types.js';
import { fetchJSON, LoadActivity } from './util.js';
import { Packument, PackumentVersion } from '@npm/types';

type ModuleCacheEntry = {
  promise: Promise<Module>;
  module?: Module; // Set once module is loaded
  error?: Error; // Set if module fails to load
};

function isPackument(obj: unknown): obj is Packument {
  // return true if obj is an object with a "versions" property
  return typeof obj && typeof (obj as Packument).versions === 'object';
}

class Store {
  activity: LoadActivity;

  moduleCache: Record<string, ModuleCacheEntry> = {};
  requestCache: { [key: string]: Promise<Packument | PackumentVersion> } = {};

  constructor(activity: LoadActivity) {
    this.activity = activity;
    this.init();
  }

  init() {
    // Reconstitute [uploaded] modules from sessionStorage
    const { sessionStorage } = window;

    for (let i = 0; i < sessionStorage.length; i++) {
      try {
        const cached = sessionStorage.getItem(sessionStorage.key(i) ?? '');
        const module = cached && JSON.parse(cached);
        if (!module?.name) continue;

        this.cachePackage(module);
      } catch (err) {
        console.error(err);
      }
    }
  }

  getCachedModule(key: string) {
    return this.moduleCache[key]?.module;
  }

  getModule(name: string, version?: string) {
    if (!name) throw Error('Invalid module name');

    // Parse versioned-names (e.g. "less@1.2.3")
    if (!version && /(.+)@(.*)/.test(name)) {
      name = RegExp.$1;
      version = RegExp.$2;
    }

    // Remove "git...#" repo URIs from version strings
    // TODO: Validate version is String on ingest
    version = version?.replace?.(/git.*#/, '');

    const cacheKey = moduleKey(name, version);

    if (!this.moduleCache[cacheKey]) {
      const cacheEntry: ModuleCacheEntry = {
        promise: this.fetchPackage(name, version)
          .then(pkg => {
            const module = new Module(pkg);

            // Cache based on arguments (memoize), but also cache based on name
            // and version as declared in module info
            cacheEntry.module = module;
            this.moduleCache[`${module.name}@${module.version}`] = cacheEntry;

            return module;
          })
          .catch(err => {
            // We don't expect to get here, so just catch and rethrow
            throw err;
          }),
      };
      this.moduleCache[cacheKey] = cacheEntry;
    }

    return this.moduleCache[cacheKey].promise;
  }

  // Inject a module directly into the request cache (used for module file uploads)
  cachePackage(pkg: ModulePackage) {
    let { name } = pkg;
    const { version } = pkg;
    name = name.replace(/\//g, '%2F');
    const path = version ? `${name}/${version}` : name;
    this.requestCache[path] = Promise.resolve(pkg);

    return path;
  }

  // fetch module url, caching results (in memory for the time being)
  async fetchPackage(name: string, version?: string) {
    const isScoped = name.startsWith('@');
    const versionIsValid = semver.valid(version);

    // url-escape "/"'s in the name
    const path = `${name.replace(/\//g, '%2F')}`;
    const pathAndVersion = `${path}/${version}`;

    // Use cached request if available.  (We can get module info from versioned or unversioned API requests)
    let req = this.requestCache[pathAndVersion] || this.requestCache[path];

    if (!req) {
      // If semver isn't valid (i.e. not a simple, canonical version - e.g.
      // "1.2.3") fetch all versions (we'll figure out the specific version
      // below)
      //
      // Also, we can't fetch scoped modules at specific versions.  See
      // https://goo.gl/dSMitm
      const reqPath = !isScoped && versionIsValid ? pathAndVersion : path;

      const finish = this.activity.start(
        `Fetching ${decodeURIComponent(reqPath)}`,
      );
      req = this.requestCache[reqPath] = fetchJSON<
        Packument | PackumentVersion
      >(`https://registry.npmjs.org/${reqPath}`).finally(finish);
    }

    function fail(err: unknown) {
      return Module.stub(
        name,
        version,
        err instanceof Error ? err : new Error(String(err)),
      );
    }

    let body: Packument | PackumentVersion;
    try {
      body = await req;
    } catch (err) {
      return fail(err as Error);
    }

    if (!body) {
      return fail('Empty module data');
    }

    if (typeof body != 'object') {
      return fail('Unexpected module data structure');
    }

    // TODO: Remember why I have this check here and document the reason!  Elsewise, :-p
    if ((body as unknown as { unpublished: boolean }).unpublished) {
      return fail('This module is unpublished');
    }

    if (isPackument(body)) {
      // Available versions (most recent first)
      const versions = Object.values(body.versions).reverse();

      // Version we're looking for
      const versionQuery =
        version || (body['dist-tags']?.latest as string) || '*';

      // Resolve to specific version (use version specifier if provided,
      // otherwise latest dist version, otherwise latest)
      const resolvedVersion = versions.find(v =>
        semver.satisfies(v.version, versionQuery),
      );
      if (resolvedVersion) {
        body = resolvedVersion as ModulePackage;
      } else {
        return fail(`No version matching "${version}" found`);
      }
    }

    return body;
  }
}

export default Store;
