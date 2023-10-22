import { Packument, PackumentVersion } from '@npm/types';
import { getModuleKey, parseModuleKey } from './module_util.js';

type OldLicense = {
  type: string;
  url: string;
};

export default class Module {
  package: PackumentVersion;
  packument?: Packument;
  isLocal = false;
  stubError?: Error;

  static stub(moduleKey: string, error: Error) {
    const [name, version] = parseModuleKey(moduleKey) ?? {};
    const module = new Module({ name, version } as PackumentVersion);
    module.stubError = error;
    return module;
  }

  // TODO: This should take either PackumentVersion or PackageJSON... but need to
  // be clear about the differences between the two!
  constructor(pkg: PackumentVersion, packument?: Packument) {
    if (!pkg.name) {
      throw new Error(`Package name is required`);
    }

    this.packument = packument;

    this.package = pkg;
  }

  get key() {
    return getModuleKey(this.name, this.version);
  }

  get name() {
    return this.package.name;
  }

  get isStub() {
    return Boolean(this.stubError);
  }

  get maintainers() {
    let maintainers = this.package.maintainers ?? [];

    if (!Array.isArray(maintainers)) {
      console.warn(
        `Unexpected maintainers type for ${this.key}: ${maintainers}`,
      );
      maintainers = [maintainers];
    }

    return maintainers.map(m => (typeof m === 'string' ? { name: m } : m));
  }

  get version() {
    const version = this.package.version;
    // I've forgotten under what circumstances package.version.version might
    // actually be a thing... :-/
    return (
      version && ((version as unknown as PackumentVersion).version || version)
    );
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
