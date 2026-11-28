import useGraphSelection from '../../hooks/useGraphSelection.ts';
import useHashParam from '../../hooks/useHashParam.ts';
import { PARAM_COLORIZE } from '../../lib/constants.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { isRepositorySpec } from '../../lib/module-util.ts';
import type Module from '../../lib/Module.ts';
import { queryModuleCache } from '../../lib/ModuleCache.ts';
import OutdatedColorizer from '../colorizers/OutdatedColorizer.tsx';
import { Pane } from '../ui/Pane.tsx';
import { ModuleDependents } from './ModuleDependents.tsx';
import { ModuleLinks } from './ModuleLinks.tsx';
import { ModuleMaintainers } from './ModuleMaintainers.tsx';
import * as styles from './ModulePane.module.css';
import { ModuleSize } from './ModuleSize.tsx';
import { ModuleDistTag } from './ModuleVersionInfo.tsx';
import { ModuleWarnings } from './ModuleWarnings.tsx';
import { ReleaseTimeline } from './ReleaseTimeline.tsx';

function useSelectedModules() {
  const [graph] = useGlobalState('graph');
  const [queryType, queryValue] = useGraphSelection();

  // Only modules in the graph can be selected (the cache also has stubs of failed queries)
  const selectedModules = queryModuleCache(
    queryType,
    queryValue,
    graph.moduleInfos,
  );

  // Fall back to the top-level module if nothing is selected
  const [entryModule] = graph.entryModules;
  if (
    entryModule &&
    graph.entryModules.size === 1 &&
    selectedModules.size === 0
  ) {
    return new Map([[entryModule.key, entryModule]]);
  }

  return selectedModules;
}

function ModuleDetailsPane({
  module,
  ...props
}: { module: Module } & React.HTMLAttributes<HTMLDivElement>) {
  const [colorize] = useHashParam(PARAM_COLORIZE);
  const pkg = module.package;
  const isShowStatus = !colorize || colorize === OutdatedColorizer.name;

  return (
    <Pane {...props}>
      <div className={styles.header}>
        <div className={styles.title}>
          <h2>{module.source ?? module.key}</h2>
          {isShowStatus && <ModuleDistTag module={module} />}
        </div>
        {pkg?.description && <p>{pkg.description}</p>}
        {module.isStub && (
          <>
            <p className={styles.stubError}>{module.stubError?.message}</p>
            {isRepositorySpec(module.version) && (
              <p>
                This dependency points to a repository (
                <code>{module.version}</code>), which npmgraph doesn't load. It
                looked for <code>{module.name}</code> on the registry instead.
              </p>
            )}
          </>
        )}
        {module.isLocal && (
          <p>
            This is a locally-defined module. Additional information is not
            available.
          </p>
        )}
      </div>

      <ModuleLinks module={module} />

      {/* Advisories and replacements are looked up by name in the registry */}
      {module.isFromRegistry && (
        <ModuleWarnings module={module} showOutdated={isShowStatus} />
      )}

      <ReleaseTimeline module={module} />

      {/* Modules loaded from elsewhere (e.g. a URL) have no registry data */}
      {module.packument && <ModuleSize module={module} />}

      <ModuleDependents module={module} />

      {module.packument && <ModuleMaintainers module={module} />}
    </Pane>
  );
}

export default function ModulePane(
  props: React.HTMLAttributes<HTMLDivElement>,
) {
  const selectedModules = useSelectedModules();

  if (selectedModules.size === 0) {
    return (
      <Pane centered>
        <p>No modules selected.</p>
      </Pane>
    );
  }

  if (selectedModules.size > 1) {
    return (
      <Pane centered>
        Multiple modules selected. Click a single module in the graph to see
        details.
      </Pane>
    );
  }

  const module = selectedModules.values().next().value;
  return module ? <ModuleDetailsPane module={module} {...props} /> : null;
}
