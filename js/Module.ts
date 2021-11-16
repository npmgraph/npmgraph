import { ModuleInfo, OldLicense } from './types';

function parseGithubPath(s) {
  s = /github.com\/([^/]+\/[^/?#]+)?/.test(s) && RegExp.$1;
  return s?.replace?.(/\.git$/, '');
}

export function moduleKey(name, version) {
  return version ? `${name}@${version}` : name;
}

export default class Module {
  package: ModuleInfo;

  static stub({ name, version, error }) {
    return {
      stub: true,
      name,
      version,
      error,
      maintainers: [],
    };
  }

  constructor(pkg: ModuleInfo) {
    if (!pkg.maintainers) {
      pkg.maintainers = [];
    } else if (!Array.isArray(pkg.maintainers)) {
      pkg.maintainers = [pkg.maintainers];
    }
    this.package = pkg;
  }

  get key() {
    return moduleKey(this.name, this.version);
  }

  get name() {
    return this.package.name;
  }

  get version() {
    const version = this.package.version;
    // I've forgotten under what circumstances package.version.version might
    // actually be a thing... :-/
    return version && ((version as unknown as ModuleInfo).version || version);
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
    let license: string = (this.package.license ||
      this.package.licenses) as string;

    // Legacy: array of licenses?
    if (Array.isArray(license)) {
      // Convert to SPDX form
      // TODO: Is "OR" the correct operator for this?
      return license.map(l => l.type || l).join(' OR ');
    }

    // Legacy: license object?
    if (typeof license == 'object') license = (license as OldLicense).type;

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
