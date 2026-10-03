import type Module from '../../../lib/Module.ts';
import type { Licenses, OSIKeyword } from '../../../lib/licenses.ts';
import type { GraphState } from '../../GraphDiagram/graph_util.ts';

export type LicenseAnalysisState = {
  modulesByLicense: Map<string, Module[]>;
  unlicensedModules: Module[];
  modulesByKeyword: Map<OSIKeyword, Module[]>;
  licenses: Licenses;
};

export function analyzeLicenses(
  { moduleInfos }: GraphState,
  licenses: Licenses,
): LicenseAnalysisState {
  const modulesByLicense = new Map<string, Module[]>();
  const unlicensedModules: Module[] = [];
  const modulesByKeyword = new Map<OSIKeyword, Module[]>();

  for (const { module } of moduleInfos.values()) {
    // Stub and private modules are not included in the license analysis
    if (module.isStub || module.package.private) {
      continue;
    }

    const moduleLicenses = module.getLicenses();

    // licensesRenderMissing
    if (moduleLicenses.length === 0 || moduleLicenses[0] === 'unlicensed') {
      unlicensedModules.push(module);
    }

    if (moduleLicenses.length === 0) {
      continue;
    }

    for (let license of moduleLicenses) {
      // licensesRenderAll
      license = license.toLowerCase();
      if (!modulesByLicense.has(license)) {
        modulesByLicense.set(license, []);
      }

      modulesByLicense.get(license)!.push(module);

      // licensesRenderKeywords
      const keywords = licenses[license]?.keywords;

      if (!keywords) {
        continue;
      }

      for (const keyword of keywords) {
        if (!modulesByKeyword.has(keyword)) {
          modulesByKeyword.set(keyword, []);
        }

        modulesByKeyword.get(keyword)!.push(module);
      }
    }
  }

  return {
    modulesByLicense,
    unlicensedModules,
    modulesByKeyword,
    licenses,
  };
}
