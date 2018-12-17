import validate from './pjv.js';
import {ajax, reportError} from './util.js';

function parseGithubPath(s) {
  return /github.com\/([^/]+\/[^/?#.]+)/.test(s) && RegExp.$1;
}

export default class Module {
  static key(name, version) {
    return `${name}@${version}`;
  }

  constructor(pkg) {
    if (!pkg.maintainers) {
      pkg.maintainers = [];
    } else if (!Array.isArray(pkg.maintainers)) {
      pkg.maintainers = [pkg.maintainers];
    }
    this.package = pkg;
  }

  validate() {
    return validate(this.package,);
  }

  get key() {
    return Module.key(this.package.name, this.package.version);
  }

  get githubPath() {
    const pkg = this.package;

    for (const k of ['repository', 'homepage', 'bugs']) {
      const path = parseGithubPath(pkg[k] && pkg[k].url);
      if (path) return path;
    }

    return null;
  }

  async getScores() {
    if (!this.package._scores) {
      let search;

      try {
        search = await ajax('GET', `https://registry.npmjs.org/-/v1/search?text=${this.package.name}&size=1`);
      } catch (err) {
        console.error(err);
        return;
      }

      const score = search.objects[0] && search.objects[0].score;
      this.package._scores = {
        final: score.final,
        quality: score.detail.quality,
        popularity: score.detail.popularity,
        maintenance: score.detail.maintenance
      };
    }

    return this.package._scores;
  }

  get licenseString() {
    // Legacy: 'licenses' field
    let license = this.package.license || this.package.licenses;

    // Legacy: array of licenses?
    if (Array.isArray(license)) {
      // Convert to SPDX form
      // TODO: Is "OR" the correct operator for this?
      return license.map(l => l.type || l).join(' OR ');
    }

    // Legacy: license object?
    if (typeof(license) == 'object') license = license.type;

    if (!license) return null;

    // Strip outer ()'s (SPDX notation)
    return String(license).replace(/^\(|\)$/g, '');
  }

  toString() {
    return this.key;
  }

  toJSON() {
    return this.package;
  }
}
