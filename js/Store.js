import {$, ajax, reportError} from './util.js';
import Module from './Module.js';
import Loader from './Loader.js';
import Flash from './Flash.js';
import * as semver from './semver.js';

window.semver = semver;

// Max time (msecs) to rely on something in localstore cache
const EXPIRE = 60 * 60 * 1000;

/**
 * HTTP request api backed by localStorage cache
 */
export default class Store {
  static init() {
    this._inflight = {};
    this._moduleCache = {};
    this._noCache = /noCache/i.test(location.search);
  }

  // GET package info
  static async getModule(name, version) {
    // url-escape "/"'s in the name
    let path = `${name.replace(/\//g, '%2F')}`;

    // If semver isn't valid (i.e. not a simple, canonical version - e.g.
    // "1.2.3") fetch all versions (we'll figure out the specific version below)
    const cachePath = semver.valid(version) ? `${path}/${version}` : path;

    if (!this._moduleCache[cachePath]) {
      let body;
      try {
        body = await this.get(semver.valid(version) ? cachePath : path);
        if (!body) throw Error('No module info found');
        if (typeof(body) != 'object') throw Error('Response was not an object');
        if (body.unpublished) throw Error('Module is unpublished');
      } catch (err) {
        if (err.status >= 500) {
          Flash(`Uppity network error (${err.status}).  Try again later?`);
        } else if (err.status > 0) {
          Flash(`${err.status} error: ${cachePath}`);
        } else {
          Flash(err);
        }

        reportError(err);
      }

      // If no explicit version was requested, find best semver match
      if (body) {
        if (body.versions) {
          let resolvedVersion;

          if (!version) {
            resolvedVersion = ('dist-tags' in body) && body['dist-tags'].latest;
          }
          if (!resolvedVersion) {
            // Pick last version that satisfies semver
            for (const v in body.versions) {
              if (semver.satisfies(v, version || '*')) resolvedVersion = v;
            }
          }

          body = body.versions[resolvedVersion];
        }
      } else {
        body = {stub: true, name, version, maintainers: []};
      }

      if (!body.stub && path != cachePath) {
        this.store(path, cachePath);
        this.store(cachePath, body);
      }

      this._moduleCache[cachePath] = this._moduleCache[path] = new Module(body);
    }

    return this._moduleCache[path];
  }

  // GET url, caching results in localStorage
  static get(path) {
    // In store?
    const stored = this.unstore(path);

    // In store?
    if (stored && !this._noCache) return stored;

    const loader = new Loader(path);
    $('#load').appendChild(loader.el);
    return ajax('GET', `https://registry.npmjs.cf/${path}`, loader);
  }

  // Store a value in localStorage, purging if there's an error
  static store(key, obj) {
    try {
      if (obj && typeof(obj) == 'object') obj._storedAt = Date.now();
      localStorage.setItem(key, JSON.stringify(obj));
    } catch (err) {
      console.warn('Error while storing. Purging cache', err);
      this.purge();
    }
  }

  // Recover a value from localStorage
  static unstore(key) {
    let obj;
    for (let i = 0; i < 10; i++) {
      obj = localStorage.getItem(key);
      if (obj) obj = JSON.parse(obj);
      if (!obj || typeof(obj) != 'string') break;
      key = obj;
    }

    return (obj && obj._storedAt > Date.now() - EXPIRE) ? obj : null;
  }

  // Remove oldest half of store
  static purge() {
    const ls = localStorage;

    // List of entries
    const entries = new Array(ls.length).fill()
      .map((v, i) => [ls.key(i), JSON.parse(ls.getItem(ls.key(i)))]);

    // Get oldest 50% of entries
    let prune = entries.filter(entry => entry[1]._storedAt > 0)
      .sort((a, b) => {
        a = a._storedAt;
        b = b._storedAt;
        return a < b ? -1 : a > b ? 1 : 0;
      });
    prune = prune.slice(0, Math.max(1, prune.length >> 1));

    // Compile list of names to prune
    const names = {};
    prune.forEach(e => names[e[0]] = true);
    entries.filter(e => names[e[0]] || names[e[1]]).forEach(e => ls.removeItem(e[0]));
  }

  static clear() {
    localStorage.clear();
    $('#storage').innerText = '0 chars';
  }
}
