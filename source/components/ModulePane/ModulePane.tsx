import useGraphSelection from '../../hooks/useGraphSelection.ts';
import useHashParam from '../../hooks/useHashParam.ts';
import { PARAM_COLORIZE } from '../../lib/constants.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
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

  const selectedModules = queryModuleCache(queryType, queryValue);

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

function StubModulePane({ module }: { module: Module }) {
  const [graph] = useGlobalState('graph');

  return (
    <Pane>
      <div className={styles.header}>
        <h2 className={styles.stubName}>{module.name}</h2>
        <p>Sorry, but info for this module isn't available. 😢</p>
        {/* Failed entry modules already show their error in the errors box */}
        {!graph.failedEntryModules.has(module.key) && (
          <p className={styles.stubError}>{module.stubError?.message}</p>
        )}
      </div>
    </Pane>
  );
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
        {module.isLocal && (
          <p>
            This is a locally-defined module. Additional information is not
            available.
          </p>
        )}
      </div>

      <ModuleLinks module={module} />

      {/* Advisories and replacements are looked up by name in the registry */}
      {!module.isLocal && (
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
  if (!module) {
    return null;
  }

  if (module.isStub) {
    return <StubModulePane module={module} />;
  }

  return <ModuleDetailsPane module={module} {...props} />;
}
