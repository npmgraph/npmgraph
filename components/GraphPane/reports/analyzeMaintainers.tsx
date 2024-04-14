import { Maintainer } from '@npm/types';
import Module from '../../../lib/Module.js';
import { report } from '../../../lib/bugsnag.js';
import { GraphState } from '../../GraphDiagram/graph_util.js';

export type MaintainerAnalysisState = {
  modulesByMaintainer: Map<string, Set<Module>>;
  soloModulesByMaintainer: Map<string, Set<Module>>;
  soloModulesCount: number;
  emailByMaintainer: Map<string, string>;
};

function normalizeMaintainer(
  maintainer: Maintainer | string,
): Exclude<Maintainer, string> {
  return !maintainer || typeof maintainer === 'string'
    ? { name: maintainer }
    : maintainer;
}

export function analyzeMaintainers({
  moduleInfos,
}: GraphState): MaintainerAnalysisState {
  const modulesByMaintainer = new Map<string, Set<Module>>();
  const emailByMaintainer = new Map<string, string>();

  let soloModulesCount = 0;
  const modules = Array.from(moduleInfos.values()).map(({ module }) => module);

  // @ts-ignore TODO: fixup code here once Map.groupBy lands in TS and VSCode
  const soloModulesByMaintainer: typeof modulesByMaintainer = Map.groupBy(
    modules,
    (module: Module) => {
      const maintainers = module.maintainers;

      // Discard stub and private modules
      if (module.isStub || module.package.private) return '';

      // Discard modules with multiple maintainers
      if (maintainers.length > 1) return '';

      soloModulesCount++;
      return maintainers[0].name;
    },
  );

  // Non-solo modules got slotted under "", so remove that key
  soloModulesByMaintainer.delete('');

  for (const { module } of moduleInfos.values()) {
    if (module.isStub) continue;

    const { maintainers } = module.package;

    for (const m of maintainers) {
      const maintainer = normalizeMaintainer(m);

      // Combine information the maintainer across multiple modules (increases
      // the odds of us having an email to generate gravatar image from)
      if (maintainer.email && maintainer.name) {
        emailByMaintainer.set(maintainer.name, maintainer.email);
      }

      if (!maintainer.name) {
        report.error(new Error(`Nameless maintainer "${m}" in ${module.key}`));
        maintainer.name = '\u{26A0}\u{FE0F} (unnamed maintainer)';
      }

      if (!modulesByMaintainer.has(maintainer.name)) {
        modulesByMaintainer.set(maintainer.name, new Set());
      }
      modulesByMaintainer.get(maintainer.name)!.add(module);
    }
  }

  return {
    modulesByMaintainer,
    soloModulesByMaintainer,
    soloModulesCount,
    emailByMaintainer,
  };
}
