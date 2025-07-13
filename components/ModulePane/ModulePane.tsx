import simplur from 'simplur';
import { useGlobalState } from '../../lib/GlobalStore.js';
import type Module from '../../lib/Module.js';
import type { Maintainer } from '../../lib/Module.js';
import { PARAM_COLORIZE } from '../../lib/constants.js';
import human from '../../lib/human.js';
import useHashParam from '../../lib/useHashParam.js';
import { ExternalLink } from '../ExternalLink.js';
import { foreachDownstream } from '../GraphDiagram/graph_util.js';
import OutdatedColorizer from '../GraphPane/colorizers/OutdatedColorizer.js';
import { GithubIcon, NpmIcon, Package } from '../Icons.js';
import { Pane } from '../Pane.js';
import { QueryLink } from '../QueryLink.js';
import { Section } from '../Section.js';
import { Tag } from '../Tag.js';
import { Tags } from '../Tags.js';
import ModuleBundleSize from './ModuleBundleSize.js';
import ModuleNpmsIOScores from './ModuleNpmsIOScores.js';
import * as styles from './ModulePane.module.scss';
import { ModuleVersionInfo } from './ModuleVersionInfo.js';
import { ReleaseTimeline } from './ReleaseTimeline.js';

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
      <Pane
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
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
          <QueryLink query={module.key} reset={false} />
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
        <div
          className="warning"
          style={{ padding: '.5em', borderRadius: '.5em' }}
        >
          <h2 style={{ color: 'darkred', marginTop: 0 }}>Deprecated Module</h2>
          {pkg.deprecated}
        </div>
      ) : null}

      <p style={{ marginTop: 0 }}>{pkg?.description}</p>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {isSingleEntryModule ? null : (
          <QueryLink
            className="bright-hover"
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '0 1em',
          }}
        >
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
                type="maintainer"
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

function getRepoUrlForModule(module: Module) {
  const { homepage, bugs, repository } = module.package;

  // Look to repository and bugs fields for a github URL
  let repo;
  if (repository) {
    if (typeof repository === 'string') {
      repo = repository;
    } else {
      repo = repository.url;
    }
  } else if (homepage) {
    repo = homepage;
  } else if (bugs) {
    repo = bugs.url;
  }

  // Extract github project path from URL
  const match = repo?.match(/github.com\/([^/]+\/[^/?#]+)?/);
  if (!match?.[1]) return undefined;

  repo = match[1].replace(/\.git$/, '');

  return `https://www.github.com/${repo}`;
}
