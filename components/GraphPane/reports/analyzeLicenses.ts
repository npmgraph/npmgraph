import type Module from '../../../lib/Module.ts';
import type { OSIKeyword } from '../../../lib/licenses.ts';
import { LICENSES } from '../../../lib/licenses.ts';
import type { GraphState } from '../../GraphDiagram/graph_util.ts';

export type LicenseAnalysisState = {
  modulesByLicense: Map<string, Module[]>;
  unlicensedModules: Module[];
  modulesByKeyword: Map<OSIKeyword, Module[]>;
};

export function analyzeLicenses({ moduleInfos }: GraphState) {
  const modulesByLicense: Map<string, Module[]> = new Map();
  const unlicensedModules: Module[] = [];
  const modulesByKeyword = new Map<OSIKeyword, Module[]>();

  for (const { module } of moduleInfos.values()) {
    // Stub and private modules are not included in the license analysis
    if (module.isStub || module.package.private) continue;

    const licenses = module.getLicenses();

    // LicensesRenderMissing
    if (licenses.length === 0 || licenses[0] === 'unlicensed') {
      unlicensedModules.push(module);
    }

    if (licenses.length === 0) continue;

    for (let license of licenses) {
      // LicensesRenderAll
      license = license.toLowerCase();
      if (!modulesByLicense.has(license)) {
        modulesByLicense.set(license, []);
      }
      modulesByLicense.get(license)!.push(module);

      // LicensesRenderKeywords
      const keywords = LICENSES[license]?.keywords;
      if (!keywords) continue;
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
  };
}
