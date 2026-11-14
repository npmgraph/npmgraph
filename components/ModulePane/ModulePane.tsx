import { useGlobalState } from '../../lib/GlobalStore.ts';
import { queryModuleCache } from '../../lib/ModuleCache.ts';
import type Module from '../../lib/Module.ts';
import { PARAM_COLORIZE } from '../../lib/constants.ts';
import useGraphSelection from '../../hooks/useGraphSelection.ts';
import useHashParam from '../../hooks/useHashParam.ts';
import OutdatedColorizer from '../colorizers/OutdatedColorizer.tsx';
import { Pane } from '../ui/Pane.tsx';
import { QueryLink } from '../ui/QueryLink.tsx';
import { ModuleActions, ModuleExternalLinks } from './ModuleLinks.tsx';
import { ModuleAdvisories } from './ModuleAdvisories.tsx';
import { ModuleDependents } from './ModuleDependents.tsx';
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

function LocalModulePane({ module }: { module: Module }) {
  return (
    <Pane>
      <h2>
        <QueryLink query={module.key} reset={false}>
          {module.isUnnamed || module.source ? module.displayName : module.key}
        </QueryLink>
      </h2>
      <p>
        This is a locally-defined module. Additional information is not
        available at this time.
      </p>
    </Pane>
  );
}

function StubModulePane({ module }: { module: Module }) {
  return (
    <Pane>
      <h2>{module.name}</h2>
      <p>Sorry, but info for this module isn't available. 😢</p>
      <p className={styles.stubError}>{module.stubError?.message}</p>
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
      <div className={styles.title}>
        <h2>{module.source ?? module.key}</h2>
        {isShowStatus && <ModuleDistTag module={module} />}
      </div>

      <p>{pkg?.description}</p>

      <div className={styles.moduleHeader}>
        <ModuleExternalLinks module={module} />
        <ModuleActions module={module} />
      </div>

      <ModuleWarnings module={module} showOutdated={isShowStatus} />

      {/* Modules loaded from elsewhere (e.g. a URL) have no registry data */}
      {module.packument && <ModuleAdvisories module={module} />}

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

  if (module.isLocal) {
    return <LocalModulePane module={module} />;
  }

  if (module.isStub) {
    return <StubModulePane module={module} />;
  }

  return <ModuleDetailsPane module={module} {...props} />;
}
