import type Module from '../../../lib/Module.ts';
import {
  getAllLicenses,
  getLicenseIssues,
  type LicenseIssue,
} from '../../../lib/licenses.ts';
import type { GraphState } from '../../../lib/graph-util.ts';

export type LicenseAnalysisState = {
  modulesByLicense: Map<string, Module[]>;
  unlicensedModules: Module[];
  licenseIssuesByLicense: Map<string, LicenseIssue[]>;
};

export async function analyzeLicenses({ moduleInfos }: GraphState) {
  const modulesByLicense = new Map<string, Module[]>();
  const unlicensedModules: Module[] = [];
  const licenseIssuesByLicense = new Map<string, LicenseIssue[]>();

  const spdxLicenses = await getAllLicenses();

  for (const { module } of moduleInfos.values()) {
    // Stub and private modules are not included in the license analysis
    if (module.isStub || module.package.private) {
      continue;
    }

    const licenses = module.getLicenses();

    // Track unlicensed modules
    if (licenses.length === 0 || licenses[0] === 'unlicensed') {
      unlicensedModules.push(module);
    }

    if (licenses.length === 0) {
      continue;
    }

    for (let license of licenses) {
      // Track by license
      license = license.toLowerCase();
      if (!modulesByLicense.has(license)) {
        modulesByLicense.set(license, []);
      }

      modulesByLicense.get(license)!.push(module);

      // Track license issues
      if (licenseIssuesByLicense.has(license)) {
        continue;
      }

      const spdxLicense = spdxLicenses.get(license);
      if (!spdxLicense) {
        continue;
      }

      const issues = getLicenseIssues(spdxLicense);
      if (issues.length > 0) {
        licenseIssuesByLicense.set(license, issues);
      }
    }
  }

  return {
    modulesByLicense,
    unlicensedModules,
    licenseIssuesByLicense,
  };
}
