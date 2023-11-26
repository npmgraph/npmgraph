import { Packument, PackumentVersion } from '@npm/types';
import { isDefined } from './guards.js';
import { getModuleKey, parseModuleKey } from './module_util.js';

type DeprecatedLicense = {
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

  getLicenses() {
    return parseLicense(
      this.package.license ||
        (this.package as unknown as { licenses: string[] }).licenses,
    );
  }

  toString() {
    return this.key;
  }

  toJSON() {
    return this.package;
  }
}

function parseLicense(
  license:
    | string
    | DeprecatedLicense
    | (string | DeprecatedLicense)[]
    | undefined,
): string[] {
  if (Array.isArray(license)) {
    return license.flatMap(parseLicense).filter(isDefined);
  } else if (typeof license === 'object') {
    license = license.type;
  }

  license = license?.trim().toLowerCase();

  if (!license) return [];

  return license.replace(/^\(|\)$/g, '').split(/\s+or\s+/);
}

function parseGithubPath(s: string) {
  const match = /github.com\/([^/]+\/[^/?#]+)?/.test(s) && RegExp.$1;
  if (!match) return undefined;
  return match?.replace?.(/\.git$/, '');
}
