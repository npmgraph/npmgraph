import doesSatisfySemver from 'semver/functions/satisfies';
import isSemverValid from 'semver/functions/valid';
import Module, { moduleKey } from './Module';
import { ModuleInfo } from './types';
import { fetchJSON, LoadActivity, report } from './util';

class Store {
  activity : LoadActivity;
  
  moduleCache = {};
  requestCache : { [key: string]: Promise<ModuleInfo> } = {};

  constructor(activity : LoadActivity) {
    this.activity = activity;
    this.init();
  }

  init() {
    // Reconstitute [uploaded] modules from sessionStorage
    const { sessionStorage } = window;

    for (let i = 0; i < sessionStorage.length; i++) {
      try {
        const module = JSON.parse(sessionStorage.getItem(sessionStorage.key(i)));
        if (!module?.name) continue;

        this.cachePackage(module);
      } catch (err) {
        console.error(err);
      }
    }
  }

  cachedEntry(key) {
    if (!this.moduleCache[key]) throw Error(`${key} is not cached`);
    return this.moduleCache[key];
  }

  getModule(name, version ?: string) {
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
      this.moduleCache[cacheKey] = this.fetchPackage(name, version)
        .then(pkg => {
          const module = new Module(pkg);

          // Cache based on arguments (memoize), but also cache based on name
          // and version as declared in module info
          this.moduleCache[cacheKey] = module;
          this.moduleCache[`${module.name}@${module.version}`] = module;

          return this.moduleCache[cacheKey] = module;
        })
        .catch(err => report.error(err));
    }

    return this.moduleCache[cacheKey];
  }

  // Inject a module directly into the request cache (used for module file uploads)
  cachePackage(pkg) {
    let { name, version } = pkg;
    name = name.replace(/\//g, '%2F');
    const path = version ? `${name}/${version}` : name;
    this.requestCache[path] = Promise.resolve(pkg);

    return path;
  }

  // fetch module url, caching results (in memory for the time being)
  async fetchPackage(name : string, version : string) {
    const isScoped = name.startsWith('@');
    const versionIsValid = isSemverValid(version);

    // url-escape "/"'s in the name
    const path = `${name.replace(/\//g, '%2F')}`;
    const pathAndVersion = `${path}/${version}`;

    // Use cached request if available.  (We can get module info from versioned or unversioned API requests)
    let req = this.requestCache[pathAndVersion] || this.requestCache[path];

    if (!req) {
      // If semver isn't valid (i.e. not a simple, canonical version - e.g.
      // "1.2.3") fetch all versions (we'll figure out the specific version below)
      //
      // Also, we can't fetch scoped modules at specific versions.  See https://goo.gl/dSMitm
      const reqPath = !isScoped && versionIsValid ? pathAndVersion : path;

      const finish = this.activity.start(`Fetching ${decodeURIComponent(reqPath)}`);
      req = this.requestCache[reqPath] = fetchJSON<ModuleInfo>(`https://registry.npmjs.cf/${reqPath}`)
        // Errors get turned into stub modules, below
        .catch(err => err)
        .finally(finish);
    }

    let body : ModuleInfo;
    let failure : Error;
    try {
      body = await req;
    } catch (err) {
      failure = err;
    }

    if (!body) {
      failure = Error('No info provided by NPM repo');
    } else if (typeof (body) != 'object') {
      failure = Error('Data provided by NPM repo is not in the expected format');
    } else if (body.unpublished) {
      failure = Error('Module is unpublished');
    } else if (body.versions) {
      // Available versions (most recent first)
      const versions = Object.values(body.versions).reverse();

      // Version we're looking for
      version = version || body['dist-tags']?.latest || '*';

      // Resolve to specific version (use version specifier if provided, otherwise latest dist version, otherwise latest)
      const resolvedVersion = versions.find(v => doesSatisfySemver(v.version, version));
      if (resolvedVersion) {
        body = resolvedVersion as ModuleInfo;
      } else {
        failure = Error(`No version matching "${version}" found`);
      } 
    }

    // Error = stub module containing the error
    if (failure) {
      return Module.stub({ name, version, error: failure });
    }

    return body;
  }
}

export default Store;
