import { PackumentVersion } from '@npm/types';
import { getModuleKey, parseModuleKey } from './module_util.js';

export interface ModulePackage extends PackumentVersion {
  _stub?: boolean;
  _local?: boolean;
  _stubError?: Error;
}

type OldLicense = {
  type: string;
  url: string;
};

export default class Module {
  package: ModulePackage;

  static stub(moduleKey: string, error: Error) {
    const [name, version] = parseModuleKey(moduleKey) ?? {};
    return new Module({
      name,
      version,
      _stub: true,
      _stubError: error,
    } as unknown as ModulePackage);
  }

  // TODO: This should take either ModulePackage or PackageJSON... but need to
  // be clear about the differences between the two!
  constructor(pkg: ModulePackage) {
    if (!pkg.name) {
      throw new Error(`Package name is required`);
    }

    if (!pkg.maintainers) {
      pkg.maintainers = [];
    } else if (!Array.isArray(pkg.maintainers)) {
      pkg.maintainers = [pkg.maintainers];
    }

    this.package = pkg;
  }

  get key() {
    return getModuleKey(this.name, this.version);
  }

  get name() {
    return this.package.name;
  }

  get maintainers() {
    return this.package.maintainers.map(m =>
      typeof m === 'string' ? { name: m } : m,
    );
  }

  get version() {
    const version = this.package.version;
    // I've forgotten under what circumstances package.version.version might
    // actually be a thing... :-/
    return (
      version && ((version as unknown as ModulePackage).version || version)
    );
  }

  get npmLink() {
    return `https://www.npmjs.com/package/${this.name}/v/${this.version}`;
  }

  get repoLink() {
    const gh = this.githubPath;
    return gh && `https://www.github.com/${gh}`;
  }

  get packageJsonLink() {
    return `https://cdn.jsdelivr.net/npm/${this.key}/package.json`;
  }

  getShareableLink() {
    const json = JSON.stringify(this.package);
    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
    hashParams.set('package_json', json);
    url.hash = hashParams.toString();
    return url;
  }

  get repository() {
    // TODO: Handle non-github repositories
    const { repository } = this.package;
    if (typeof repository == 'string') return repository;
    return repository?.url;
  }

  get githubPath() {
    const { homepage, bugs } = this.package;

    const url = this.repository ?? homepage ?? bugs?.url;

    return url ? parseGithubPath(url) : undefined;
  }

  get licenseString() {
    let license = this.package.license;

    // Legacy: 'licenses' field
    //
    // E.g. htmlparser@1.7.7 needs this
    if (!license && 'licenses' in this.package) {
      license = this.package.licenses as string;
    }

    // Legacy: Array of licenses?
    //
    // E.g. htmlparser@1.7.7 needs this
    if (Array.isArray(license)) {
      // Convert to SPDX form
      // TODO: Is "OR" the correct operator for this?
      return license.map(l => l.type || l).join(' OR ');
    }

    // Legacy: license object?
    //
    // E.g. lru-cache@1.0.6 needs this
    if (typeof license == 'object') {
      license = (license as OldLicense).type;
    }

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

function parseGithubPath(s: string) {
  const match = /github.com\/([^/]+\/[^/?#]+)?/.test(s) && RegExp.$1;
  if (!match) return undefined;
  return match?.replace?.(/\.git$/, '');
}
