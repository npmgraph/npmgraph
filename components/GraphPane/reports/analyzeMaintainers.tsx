import type { Maintainer } from '../../../lib/Module.js';
import type Module from '../../../lib/Module.js';
import { report } from '../../../lib/bugsnag.js';
import type { GraphState } from '../../GraphDiagram/graph_util.js';

export interface MaintainerAnalysisState {
  modulesByMaintainer: Map<string, Set<Module>>
  soloModulesByMaintainer: Map<string, Set<Module>>
  soloModulesCount: number
  emailByMaintainer: Map<string, string>
}

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

  // Find modules that have a single maintainer, group by maintainer
  //
  // @ts-expect-error  TODO: unignore once Map.groupBy lands in TS types
  const soloModulesByMaintainer: typeof modulesByMaintainer = Map.groupBy(
    modules,
    (module: Module) => {
      const { maintainers } = module;

      // Group modules we aren't interested in under "" (removed below)
      if (module.isStub || module.package.private || maintainers.length !== 1)
        return '';

      soloModulesCount++;
      return maintainers[0].name;
    },
  );

  // Remove the "" key (modules we're not interested in)
  soloModulesByMaintainer.delete('');

  for (const { module } of moduleInfos.values()) {
    if (module.isStub)
      continue;

    const { maintainers } = module;

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
