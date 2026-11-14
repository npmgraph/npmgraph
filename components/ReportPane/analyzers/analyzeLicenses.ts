import type Module from '../../../lib/Module.ts';
import type { GraphState } from '../../../lib/graph-util.ts';

export type LicenseAnalysisState = {
  modulesByLicense: Map<string, Module[]>;
  unlicensedModules: Module[];
};

export function analyzeLicenses({ moduleInfos }: GraphState) {
  const modulesByLicense = new Map<string, Module[]>();
  const unlicensedModules: Module[] = [];

  for (const { module } of moduleInfos.values()) {
    // Stub and private modules are not included in the license analysis
    if (module.isStub || module.package.private) {
      continue;
    }

    const licenses = module.getLicenses();

    if (licenses.length === 0 || licenses[0] === 'unlicensed') {
      unlicensedModules.push(module);
    }

    for (let license of licenses) {
      license = license.toLowerCase();
      if (!modulesByLicense.has(license)) {
        modulesByLicense.set(license, []);
      }

      modulesByLicense.get(license)!.push(module);
    }
  }

  return { modulesByLicense, unlicensedModules };
}
