import simplur from 'simplur';
import * as indexStyles from '../../index.module.scss';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import type Module from '../../lib/Module.ts';
import type { Maintainer } from '../../lib/Module.ts';
import { QueryType } from '../../lib/ModuleCache.ts';
import { PARAM_COLORIZE } from '../../lib/constants.ts';
import { cn } from '../../lib/dom.ts';
import human from '../../lib/human.ts';
import { getRepoUrlForModule } from '../../lib/repo_util.ts';
import useHashParam from '../../lib/useHashParam.ts';
import { ExternalLink } from '../ExternalLink.tsx';
import { foreachDownstream } from '../GraphDiagram/graph_util.ts';
import OutdatedColorizer from '../GraphPane/colorizers/OutdatedColorizer.tsx';
import { GithubIcon, NpmIcon, Package } from '../Icons.tsx';
import { Pane } from '../Pane.tsx';
import { QueryLink } from '../QueryLink.tsx';
import { Section } from '../Section.tsx';
import { Tag, Tags } from '../Tag.tsx';
import ModuleBundleSize from './ModuleBundleSize.tsx';
import ModuleNpmsIOScores from './ModuleNpmsIOScores.tsx';
import * as styles from './ModulePane.module.scss';
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
  const [graph] = useGlobalState('graph');

  if (nSelected === 0) {
    return (
      <Pane className={styles.centered}>
        <p>No modules selected.</p>
      </Pane>
    );
  } else if (nSelected > 1) {
    return (
      <Pane>
        Multiple modules selected. Click a single module in the graph to see
        details.
      </Pane>
    );
  }

  const module = selectedModules?.values().next().value as Module;

  const pkg = module.package;

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

  const { unpackedSize } = module;

  let downstreamUnpackedSize = 0;
  if (graph) {
    foreachDownstream(module, graph, m => {
      downstreamUnpackedSize += m.unpackedSize ?? 0;
    });
  }

  const isSingleEntryModule =
    graph.entryModules.size === 1 &&
    [...graph.entryModules][0].key === module.key;
  const maintainers = module.maintainers;

  const npmUrl = `https://www.npmjs.com/package/${module.name}/v/${module.version}`;
  const packageUrl = `https://cdn.jsdelivr.net/npm/${module.key}/package.json`;
  const repoUrl = getRepoUrlForModule(module);
  const homepageUrl =
    module.package.homepage &&
    !module.package.homepage.startsWith('https://github.com/')
      ? module.package.homepage
      : null;

  return (
    <Pane {...props}>
      <div style={{ marginBlock: '1em 0.5em' }}>
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
        {isSingleEntryModule ? null : (
          <QueryLink
            className={indexStyles.brightHover}
            query={module.key}
            style={{ textDecoration: 'none' }}
          >
            ← Go
          </QueryLink>
        )}
        <ExternalLink href={npmUrl} icon={NpmIcon}>
          npm
        </ExternalLink>
        {repoUrl && (
          <ExternalLink href={repoUrl} icon={GithubIcon}>
            GitHub
          </ExternalLink>
        )}
        <ExternalLink href={packageUrl} icon={Package}>
          package.json
        </ExternalLink>
        {homepageUrl && (
          <ExternalLink href={homepageUrl}>Homepage</ExternalLink>
        )}
      </div>

      <ReleaseTimeline module={module} />

      <Section title="Module Size">
        <div className={styles.sizeGrid}>
          <span>Unpacked Size (module only):</span>
          {unpackedSize ? (
            <strong>{human(unpackedSize, 'B')}</strong>
          ) : (
            <i>not available</i>
          )}
          <span>Unpacked Size (module + dependencies):</span>
          {unpackedSize ? (
            <strong>{human(unpackedSize + downstreamUnpackedSize, 'B')}</strong>
          ) : (
            <i>not available</i>
          )}
        </div>
        <ModuleBundleSize module={module} />
      </Section>

      <Section title="npms.io Score">
        <ModuleNpmsIOScores module={module} />
      </Section>

      <Section
        title={simplur`${Object.entries(maintainers).length} Maintainer[|s]`}
      >
        <Tags>
          {maintainers.map(
            ({ name = 'Unknown', email }: Exclude<Maintainer, string>) => (
              <Tag
                key={name + email}
                type={QueryType.Maintainer}
                value={name}
                gravatar={email}
              />
            ),
          )}
        </Tags>
      </Section>
    </Pane>
  );
}
