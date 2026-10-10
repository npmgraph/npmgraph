import type Module from '../../lib/Module.ts';
import { PARAM_COLORIZE } from '../../lib/constants.ts';
import { cn } from '../../lib/dom.ts';
import useHashParam from '../../hooks/useHashParam.ts';
import OutdatedColorizer from '../colorizers/OutdatedColorizer.tsx';
import { Pane } from '../ui/Pane.tsx';
import { QueryLink } from '../ui/QueryLink.tsx';
import { ModuleActions, ModuleExternalLinks } from './ModuleLinks.tsx';
import { ModuleMaintainers } from './ModuleMaintainers.tsx';
import * as styles from './ModulePane.module.scss';
import { ModuleSize } from './ModuleSize.tsx';
import { ModuleVersionInfo } from './ModuleVersionInfo.tsx';
import { ReleaseTimeline } from './ReleaseTimeline.tsx';

export default function ModulePane({
  selectedModules,
  ...props
}: {
  selectedModules: Map<string, Module>;
} & React.HTMLAttributes<HTMLDivElement>) {
  const [colorize] = useHashParam(PARAM_COLORIZE);
  const nSelected = selectedModules.size;

  if (nSelected === 0) {
    return (
      <Pane className={styles.centered}>
        <p>No modules selected.</p>
      </Pane>
    );
  }

  if (nSelected > 1) {
    return (
      <Pane className={styles.centered}>
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
    return (
      <Pane>
        <h2>
          <QueryLink query={module.key} reset={false}>
            {module.isUnnamed ? module.displayName : module.key}
          </QueryLink>
        </h2>
        <p>
          This is a locally-defined module. Additional information is not
          available at this time.
        </p>
      </Pane>
    );
  }

  if (module.isStub) {
    return (
      <Pane>
        <h2>{module.name}</h2>
        <p>Sorry, but info for this module isn't available. 😢</p>
        <p className={styles.stubError}>{module.stubError?.message}</p>
      </Pane>
    );
  }

  const pkg = module.package;

  return (
    <Pane {...props}>
      <div style={{ marginBlockEnd: '0.5em' }}>
        <h2 style={{ display: 'inline' }}>{module.key}</h2>
        {!colorize || colorize === OutdatedColorizer.name ? (
          <ModuleVersionInfo module={module} style={{ flexGrow: 1 }} />
        ) : null}
      </div>

      {pkg.deprecated ? (
        <div className={cn(styles.warning, styles.deprecatedBox)}>
          <h2 className={styles.deprecatedTitle}>Deprecated Module</h2>
          {pkg.deprecated}
        </div>
      ) : null}

      <p style={{ marginTop: 0 }}>{pkg?.description}</p>

      <div className={styles.moduleHeader}>
        <ModuleActions module={module} />
        <ModuleExternalLinks module={module} />
      </div>

      <ReleaseTimeline module={module} />

      <ModuleSize module={module} />

      <ModuleMaintainers module={module} />
    </Pane>
  );
}
