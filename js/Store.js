import { fetchJSON, report } from './util';
import Module, { moduleKey } from './Module';
import * as semver from '/vendor/semver';

class Store {
  moduleCache = {};
  requestCache = {};

  constructor(activity) {
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

  getModule(name, version) {
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
  async fetchPackage(name, version) {
    const isScoped = name.startsWith('@');
    const versionIsValid = semver.valid(version);

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
      req = this.requestCache[reqPath] = fetchJSON(`https://registry.npmjs.cf/${reqPath}`)
        // Errors get turned into stub modules, below
        .catch(err => err)
        .finally(finish);
    }

    let body;
    try {
      body = await req;
    } catch (err) {
      body = err;
    }

    if (!body) {
      body = Error('No info provided by NPM repo');
    } else if (typeof (body) != 'object') {
      body = Error('Data provided by NPM repo is not in the expected format');
    } else if (body.unpublished) {
      body = Error('Module is unpublished');
    } else if (body.versions) {
      // Available versions (most recent first)
      const versions = Object.values(body.versions).reverse();

      // Version we're looking for
      version = version || body['dist-tags']?.latest || '*';

      // Resolve to specific version (use version specifier if provided, otherwise latest dist version, otherwise latest)
      const resolvedVersion = versions.find(v => semver.satisfies(v.version, version));

      body = resolvedVersion || Error(`No version matching "${version}" found`);
    }

    // Error = stub module containing the error
    if (body instanceof Error) {
      return Module.stub({ name, version, error: body });
    }

    return body;
  }
}

export default Store;
