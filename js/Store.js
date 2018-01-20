import {$, ajax} from './util.js';
import Module from './Module.js';
import Loader from './Loader.js';

// Max time (msecs) to rely on something in localstore cache
const EXPIRE = 24 * 60 * 60 * 1000;

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
    let path = `${name.replace(/\//g, '%2F')}`;
    if (version) path += `/${version}`;

    if (!this._moduleCache[path]) {
      let body;
      try {
        body = await this.get(path);
        if (!body) throw Error('No module info found');
        if (typeof(body) != 'object') throw Error('Response was not an object');
      } catch (err) {
        console.error('Failed to load', path, err);
        body = {stub: true, name, version, maintainers: []};
      }

      // If fetched a path with no version, NPM repo returns info about *all*
      // versions, so pick the most appropriate one
      if (body.versions) {
        let vname;
        if ('dist-tags' in body && 'latest' in body['dist-tags']) {
          // Use version specified by 'latest' dist-tag
          vname = body['dist-tags'].latest;
        }
        if (!vname) {
          // Use most recent version
          // TODO: use highest semver instead of most recently published version
          const times = Object.keys(body.time);
          times.sort((a, b) => {
            a = Date.parse(a);
            b = Date.parse(b);
            return a < b ? -1 : a > b ? 1 : 0;
          });
          vname = times.pop();
        }

        body = body.versions[vname];
      }

      const versionPath = `${body.name.replace(/\//g, '%2F')}/${body.version}`;

      if (!body.stub && path != versionPath) {
        this.store(path, versionPath);
        this.store(versionPath, body);
      }

      this._moduleCache[versionPath] = this._moduleCache[path] = new Module(body);
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

    // Copile list of names to prune
    const names = {};
    prune.forEach(e => names[e[0]] = true);
    entries.filter(e => names[e[0]] || names[e[1]]).forEach(e => ls.removeItem(e[0]));
  }

  static clear() {
    localStorage.clear();
    $('#storage').innerText = '0 chars';
  }
}
