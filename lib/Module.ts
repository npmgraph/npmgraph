import type { Packument, PackumentVersion } from '@npm/types';
import { isDefined } from './guards.js';
import {
  getModuleKey,
  parseModuleKey,
  resolveDependencyAliases,
} from './module_util.js';

export type Maintainers = PackumentVersion['maintainers'];
export type Maintainer = Exclude<Maintainers, undefined>[0];
export type Dependencies = PackumentVersion['dependencies'];

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
    this.package = resolveDependencyAliases(pkg);
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
    const pkg = this.getLatestVersion() ?? this.package;
    let maintainers = pkg.maintainers ?? [];

    if (!Array.isArray(maintainers)) {
      console.warn(
        `Unexpected maintainers type for ${this.key}: ${maintainers}`,
      );
      maintainers = [maintainers];
    }

    return maintainers.map((m: Maintainer) =>
      typeof m === 'string' ? { name: m } : m,
    );
  }

  get unpackedSize() {
    return this.package.dist?.unpackedSize;
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

  getLatestVersion() {
    const latestVersion = this.packument?.['dist-tags'].latest;
    if (!latestVersion) return;
    return this.packument?.versions[latestVersion];
  }

  getLicenses() {
    // Pick license from latest `dist` version, if available
    const pkg = this.getLatestVersion() ?? this.package;

    return parseLicense(
      pkg.license || (pkg as unknown as { licenses: string[] }).licenses,
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
  return s.match(/github.com\/[^/]+\/[^/?#]+/)?.[0]?.replace(/\.git$/, '');
}
