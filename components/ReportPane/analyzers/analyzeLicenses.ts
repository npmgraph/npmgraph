import type Module from '../../../lib/Module.ts';
import { getAllLicenses } from '../../../lib/licenses.ts';
import type { GraphState } from '../../../lib/graph-util.ts';

export type LicenseAnalysisState = {
  modulesByLicense: Map<string, Module[]>;
  unlicensedModules: Module[];
  deprecatedLicenseModules: Module[];
};

export async function analyzeLicenses({ moduleInfos }: GraphState) {
  const modulesByLicense = new Map<string, Module[]>();
  const unlicensedModules: Module[] = [];
  const deprecatedLicenseModules = new Set<Module>();

  const spdxLicenses = await getAllLicenses();

  for (const { module } of moduleInfos.values()) {
    // Stub and private modules are not included in the license analysis
    if (module.isStub || module.package.private) {
      continue;
    }

    const licenses = module.getLicenses();

    // licensesRenderMissing
    if (licenses.length === 0 || licenses[0] === 'unlicensed') {
      unlicensedModules.push(module);
    }

    if (licenses.length === 0) {
      continue;
    }

    for (let license of licenses) {
      // licensesRenderAll
      license = license.toLowerCase();
      if (!modulesByLicense.has(license)) {
        modulesByLicense.set(license, []);
      }

      modulesByLicense.get(license)!.push(module);

      // licensesRenderDeprecated
      const spdxLicense = spdxLicenses.get(license);
      if (spdxLicense?.isDeprecatedLicenseId) {
        deprecatedLicenseModules.add(module);
      }
    }
  }

  return {
    modulesByLicense,
    unlicensedModules,
    deprecatedLicenseModules: [...deprecatedLicenseModules],
  };
}
