import Module from '../../../lib/Module.js';
import { LICENSES, OSIKeyword } from '../../../lib/licenses.js';
import { GraphState } from '../../GraphDiagram/graph_util.js';

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

    // licensesRenderMissing
    if (!licenses.length || licenses[0] === 'unlicensed') {
      unlicensedModules.push(module);
    }

    if (!licenses.length) continue;

    for (let license of licenses) {
      // licensesRenderAll
      license = license.toLowerCase();
      if (!modulesByLicense.has(license)) {
        modulesByLicense.set(license, []);
      }
      modulesByLicense.get(license)!.push(module);

      // licensesRenderKeywords
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
