import validate from './pjv.js';

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
