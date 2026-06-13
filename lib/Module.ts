import type { Packument, PackumentVersion } from '@npm/types';
import { UNNAMED_PACKAGE, UNNAMED_PACKAGE_PREFIX } from './constants.ts';
import { isDefined } from './guards.ts';
import {
  getModuleKey,
  parseModuleKey,
  resolveDependencyAliases,
} from './module_util.ts';

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

  // Note: This should take either PackumentVersion or PackageJSON... but need to
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

  /** True if this module was loaded from a package.json that had no `name` field */
  get isUnnamed() {
    return this.name.startsWith(UNNAMED_PACKAGE_PREFIX);
  }

  /** User-facing display name. Returns 'unnamed module' for unnamed packages */
  get displayName() {
    return this.isUnnamed ? UNNAMED_PACKAGE : this.name;
  }

  get isStub() {
    return Boolean(this.stubError);
  }

  get maintainers() {
    let maintainers =
      this.packument?.maintainers ??
      this.getLatestVersion()?.maintainers ??
      this.package?.maintainers ??
      [];

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
    const { version } = this.package;
    // I've forgotten under what circumstances package.version.version might
    // actually be a thing... :-/
    return (
      version && ((version as unknown as PackumentVersion).version || version)
    );
  }

  getShareableLink() {
    const json = JSON.stringify(this.package);
    const url = new URL(location.href);
    const hashParameters = new URLSearchParams(
      location.hash.replace(/^#/v, ''),
    );
    hashParameters.set('package_json', json);
    url.hash = hashParameters.toString();
    return url;
  }

  get repository() {
    // Note: Handle non-github repositories
    const { repository } = this.package;
    if (typeof repository === 'string') return repository;
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
    return license
      .flatMap(value => parseLicense(value))
      .filter(value => isDefined(value));
  }
  if (typeof license === 'object') {
    license = license.type;
  }

  license = license?.trim().toLowerCase();

  if (!license) return [];

  return license.replaceAll(/^\(|\)$/gv, '').split(/\s+or\s+/);
}

function parseGithubPath(s: string) {
  return s.match(/github\.com\/[^/]+\/[^/?#]+/)?.[0]?.replace(/\.git$/v, '');
}
