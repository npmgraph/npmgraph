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

  get key() {
    return Module.key(this.package.name, this.package.version);
  }

  toString() {
    return this.key;
  }

  toJSON() {
    return this.package;
  }
}
