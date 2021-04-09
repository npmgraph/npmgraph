import validate from '/vendor/pjv.js';

function parseGithubPath(s) {
  s = /github.com\/([^/]+\/[^/?#]+)?/.test(s) && RegExp.$1;
  return s?.replace?.(/\.git$/, '');
}

export function moduleKey(name, version) {
  return version ? `${name}@${version}` : name;
}

export default class Module {
  static stub({ name, version, error }) {
    return {
      stub: true,
      name,
      version,
      error,
      maintainers: []
    };
  }

  constructor(pkg = {}) {
    if (!pkg.maintainers) {
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
    return moduleKey(this.name, this.version);
  }

  get name() {
    return this.package.name;
  }

  get version() {
    const version = this.package.version;
    return version && (version.version || version);
  }

  get npmLink() {
    return `https://www.npmjs.com/package/${this.name}/v/${this.version}`;
  }

  get repoLink() {
    const gh = this.githubPath;
    return gh && `https://www.github.com/${gh}`;
  }

  get apiLink() {
    return `https://registry.npmjs.cf/${this.name}/${this.version}`;
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
