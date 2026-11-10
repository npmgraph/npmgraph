import type { PackageJSON, Packument, PackumentVersion } from '@npm/types';
import hostedGitInfo from 'hosted-git-info';
import { UNNAMED_PACKAGE, UNNAMED_PACKAGE_PREFIX } from './constants.ts';
import { isDefined } from './guards.ts';
import { hashSet } from './url-util.ts';
import {
  getModuleKey,
  parseModuleKey,
  resolveDependencyAliases,
} from './module-util.ts';

type Maintainers = PackumentVersion['maintainers'];
export type Maintainer = Exclude<Maintainers, undefined>[0];

type DeprecatedLicense = {
  type: string;
  url: string;
};

export default class Module {
  static stub(moduleKey: string, error: Error) {
    const [name, version] = parseModuleKey(moduleKey) ?? {};
    const module = new Module({ name, version } as PackumentVersion);
    module.stubError = error;
    return module;
  }

  package: PackumentVersion;
  packument?: Packument;
  isLocal = false;
  // Where the module was loaded from, if not the registry, e.g. "repo: user/name"
  source?: string;
  stubError?: Error;

  /**
  Wraps a package manifest, whether it came from the registry or a package.json.

  @param pkg Either a registry `PackumentVersion` (normalized by npm: has `_id`,
  `dist` and `_npmVersion`, and `author`, `bugs`, `maintainers` and `repository`
  are always objects) or a raw `PackageJSON` from a URL or upload (loose: those
  fields may also be strings, and there's no registry metadata)
  @param packument The registry packument `pkg` came from, if any
  */
  constructor(pkg: PackumentVersion | PackageJSON, packument?: Packument) {
    if (!pkg.name) {
      throw new Error(`Package name is required`);
    }

    this.packument = packument;
    this.package = resolveDependencyAliases(pkg as PackumentVersion);
  }

  get key() {
    return getModuleKey(this.name, this.version);
  }

  get name() {
    return this.package.name;
  }

  /**
  True if this module was loaded from a package.json that had no `name` field
  */
  get isUnnamed() {
    return this.name.startsWith(UNNAMED_PACKAGE_PREFIX);
  }

  /**
  User-facing display name. Returns 'unnamed module' for unnamed packages
  */
  get displayName() {
    return this.source ?? (this.isUnnamed ? UNNAMED_PACKAGE : this.name);
  }

  /**
  Full label of the module: where it was loaded from or its name and version
  */
  get label() {
    return this.source ?? this.key;
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
      console.warn(`Unexpected maintainers type for ${this.key}`, maintainers);
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
    url.hash = hashSet('package_json', json);
    return url;
  }

  get repository() {
    const { repository } = this.package;
    const url = typeof repository === 'string' ? repository : repository?.url;
    return url && (hostedGitInfo.fromUrl(url)?.browse() ?? url);
  }

  get githubPath() {
    const { homepage, bugs } = this.package;

    const url = this.repository ?? homepage ?? bugs?.url;

    return url ? parseGithubPath(url) : undefined;
  }

  getLatestVersion() {
    const latestVersion = this.packument?.['dist-tags'].latest;
    if (!latestVersion) {
      return;
    }

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
    string | DeprecatedLicense | Array<string | DeprecatedLicense> | undefined,
): string[] {
  if (Array.isArray(license)) {
    return license
      .flatMap(value => parseLicense(value))
      .filter(value => isDefined(value));
  }

  if (typeof license === 'object') {
    license = license.type;
  }

  return license
    ? license
        .trim()
        .toLowerCase()
        .replaceAll(/^\(|\)$/gv, '')
        .split(/\s+or\s+/)
    : [];
}

function parseGithubPath(s: string) {
  return /github\.com\/[^/]+\/[^#/?]+/.exec(s)?.[0]?.replace(/\.git$/v, '');
}
