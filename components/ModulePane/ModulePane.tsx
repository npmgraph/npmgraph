import { useGlobalState } from '../../lib/GlobalStore.ts';
import type Module from '../../lib/Module.ts';
import { PARAM_COLORIZE } from '../../lib/constants.ts';
import { cn } from '../../lib/dom.ts';
import { getRepoUrlForModule } from '../../lib/repo-util.ts';
import useHashParam from '../../hooks/useHashParam.ts';
import OutdatedColorizer from '../colorizers/OutdatedColorizer.tsx';
import { Pane } from '../ui/Pane.tsx';
import { QueryLink } from '../ui/QueryLink.tsx';
import * as utilities from '../ui/utilities.module.scss';
import { ModuleMaintainers } from './ModuleMaintainers.tsx';
import * as styles from './ModulePane.module.scss';
import { ModuleSize } from './ModuleSize.tsx';
import { ModuleVersionInfo } from './ModuleVersionInfo.tsx';
import { ReleaseTimeline } from './ReleaseTimeline.tsx';
import useCollapse from '../../hooks/useCollapse.ts';

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a target="_blank" href={href} className={utilities.brightHover}>
      {children}
    </a>
  );
}

export default function ModulePane({
  selectedModules,
  ...props
}: {
  selectedModules: Map<string, Module>;
} & React.HTMLAttributes<HTMLDivElement>) {
  const [colorize] = useHashParam(PARAM_COLORIZE);
  const nSelected = selectedModules.size;
  const [collapse, setCollapse] = useCollapse();
  const [graph] = useGlobalState('graph');

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

  const isSingleEntryModule =
    graph.entryModules.size === 1 &&
    [...graph.entryModules][0]?.key === module.key;

  const npmUrl = `https://www.npmjs.com/package/${module.name}/v/${module.version}`;
  const packageUrl = `https://cdn.jsdelivr.net/npm/${module.key}/package.json`;
  const repoUrl = getRepoUrlForModule(module);
  const homepageUrl =
    module.package.homepage &&
    !module.package.homepage.startsWith('https://github.com/')
      ? module.package.homepage
      : null;

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
        <div className={styles.linkGroup}>
          {isSingleEntryModule ? null : (
            <>
              <label>
                <input
                  type="checkbox"
                  checked={collapse.includes(module.name)}
                  className={utilities.brightHover}
                  onChange={() => {
                    if (collapse.includes(module.name)) {
                      setCollapse(
                        collapse.filter(name => name !== module.name),
                      );
                    } else {
                      setCollapse([...collapse, module.name]);
                    }
                  }}
                />
                Collapse
              </label>
              <QueryLink
                className={utilities.brightHover}
                query={module.key}
                style={{ textDecoration: 'none' }}
              >
                Focus
              </QueryLink>
            </>
          )}
        </div>
        <div className={styles.linkGroup}>
          <ExternalLink href={npmUrl}>npm</ExternalLink>
          {repoUrl && <ExternalLink href={repoUrl}>repo</ExternalLink>}
          {homepageUrl && (
            <ExternalLink href={homepageUrl}>website</ExternalLink>
          )}
          <ExternalLink href={packageUrl}>package.json</ExternalLink>
        </div>
      </div>

      <ReleaseTimeline module={module} />

      <ModuleSize module={module} />

      <ModuleMaintainers module={module} />
    </Pane>
  );
}
