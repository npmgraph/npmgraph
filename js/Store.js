import { ajax, report } from './util.js';
import Module from './Module.js';
import Flash from './Flash.js';
import * as semver from '../vendor/semver.js';

const _requestCache = {};
const stats = { active: 0, complete: 0 };

// fetch module url, caching results (in memory for the time being)
function fetchModule(name, version) {
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

    req = _requestCache[reqPath] = ajax('GET', `https://registry.npmjs.cf/${reqPath}`);

    req.finally(() => {
      stats.active--;
      stats.complete++;
      Store.onRequest?.(stats);
    });

    stats.active++;
    Store.onRequest?.(stats);
  }

  return req.then(body => {
    if (!body) throw Error('No module info found');
    if (typeof (body) != 'object') throw Error('Response was not an object');
    if (body.unpublished) throw Error('Module is unpublished');

    // If no explicit version was requested, find best semver match
    const versions = body?.versions;
    if (versions) {
      let resolvedVersion;

      // Use latest dist tags, if available
      if (!version && ('dist-tags' in body)) {
        resolvedVersion = body['dist-tags'].latest;
      }

      if (!resolvedVersion) {
        // Pick last version that satisfies semver
        for (const v in versions) {
          if (semver.satisfies(v, version || '*')) resolvedVersion = v;
        }
      }

      body = versions[resolvedVersion];
    }

    // If we fail to find info, just create a stub entry
    if (!body) {
      body = { stub: true, name, version, maintainers: [] };
    }

    return body;
  });
}

const _moduleCache = {};
const Store = {
  async getModule(name, version) {
    const cacheKey = `${name}@${version}`;

    if (!_moduleCache[cacheKey]) {
      _moduleCache[cacheKey] = fetchModule(name, version)
        .then(moduleInfo => {
          return new Module(moduleInfo);
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