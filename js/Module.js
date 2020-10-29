import validate from '../vendor/pjv.js';

function parseGithubPath(s) {
  s = /github.com\/([^/]+\/[^/?#]+)?/.test(s) && RegExp.$1;
  return s?.replace?.(/\.git$/, '');
}

function key(name, version) {
  version = /(\d+\.\d+\.\d+)/.test(version) && RegExp.$1;
  return `${name}@${version}`;
}

export default class Module {
  constructor(pkg = {}) {
    if (!pkg?.maintainers) {
      pkg.maintainers = [];
    } else if (!Array.isArray(pkg.maintainers)) {
      pkg.maintainers = [pkg.maintainers];
    }
    this.package = pkg;
  }

  validate() {
    return validate(this.package);
  }

  get key() {
    return key(this.package.name, this.version);
  }

  get version() {
    const version = this.package.version;
    return version && (version.version || version);
  }

  get npmLink() {
    return `https://www.npmjs.com/package/${this.package.name}/v/${this.version}`;
  }

  get repoLink() {
    const gh = this.githubPath;
    return gh && `https://www.github.com/${gh}`;
  }

  get apiLink() {
    return `https://registry.npmjs.cf/${this.package.name}/${this.version}`;
  }

  get githubPath() {
    const pkg = this.package;

    for (const k of ['repository', 'homepage', 'bugs']) {
      const path = parseGithubPath(pkg[k]?.url);
      if (path) return path;
    }

    return null;
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
    if (typeof (license) == 'object') license = license.type;

    if (!license) return undefined;

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