import { fetchJSON, report } from './util.js';
import Module from './Module.js';
import Flash from './Flash.js';
import * as semver from '/vendor/semver.js';

const _requestCache = {};
const stats = { active: 0, complete: 0 };

function moduleEntryFromKey(key) {
  const MODULE_RE = /^(@?[^@]+)(?:@(.*))?$/;

  if (!MODULE_RE.test(key)) console.log('Invalid key', key);

  return RegExp.$2 ? [RegExp.$1, RegExp.$2] : [RegExp.$1];
}

// Inject a module directly into the request cache (used for module file uploads)
export function cacheModule(module) {
  const path = `${module.name.replace(/\//g, '%2F')}`;
  _requestCache[path] = Promise.resolve(module);

  return path;
}

// fetch module url, caching results (in memory for the time being)
async function fetchModule(name, version) {
  const isScoped = name.startsWith('@');
  const versionIsValid = semver.valid(version);

  // url-escape "/"'s in the name
  const path = `${name.replace(/\//g, '%2F')}`;
  const pathAndVersion = `${path}/${version}`;

  // Use cached request if available.  (We can get module info from versioned or unversioned API requests)
  let req = _requestCache[pathAndVersion] || _requestCache[path];

  if (!req) {
    // If semver isn't valid (i.e. not a simple, canonical version - e.g.
    // "1.2.3") fetch all versions (we'll figure out the specific version below)
    //
    // Also, we can't fetch scoped modules at specific versions.  See https://goo.gl/dSMitm
    const reqPath = !isScoped && versionIsValid ? pathAndVersion : path;

    req = _requestCache[reqPath] = fetchJSON(`https://registry.npmjs.cf/${reqPath}`)
      // Errors get turned into stub modules, below
      .catch(err => err);

    req.finally(() => {
      stats.active--;
      stats.complete++;
      Store.onRequest?.(stats);
    });

    stats.active++;
    Store.onRequest?.(stats);
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
    // If no explicit version was requested, find best semver match
    const versions = body?.versions;

    // Use latest dist tags, if available, otherwise find most recent matching version
    const resolvedVersion = body['dist-tags']?.latest ||
      [...versions].reverse() // Order by most-recent first
        .find(v => semver.satisfies(v, version || '*'));

    body = versions[resolvedVersion] || Error(`No version matching "${version}" found`);
  }

  // Error = stub module containing the error
  if (body instanceof Error) {
    return Module.stub({ name, version, error: body });
  }

  return body;
}

const _moduleCache = {};
const Store = {
  cachedEntry(key) {
    if (!_moduleCache[key]) throw Error(`${key} is not cached`);
    return _moduleCache[key];
  },

  getModuleForKey(key) {
    return this.getModule(...moduleEntryFromKey(key));
  },

  getModule(name, version) {
    const cacheKey = `${name}@${version}`;

    if (!_moduleCache[cacheKey]) {
      _moduleCache[cacheKey] = fetchModule(name, version)
        .then(moduleInfo => {
          const module = new Module(moduleInfo);

          // Cache based on arguments (memoize), but also cache based on name
          // and version as declared in module info
          _moduleCache[cacheKey] = module;
          _moduleCache[`${module.name}@${module.version}`] = module;

          return _moduleCache[cacheKey] = module;
        })
        .catch(err => {
          if ('status' in err) {
            Flash(err.message);
          } else {
            report.error(err);
          }
        });
    }

    return _moduleCache[cacheKey];
  }
};

export default Store;