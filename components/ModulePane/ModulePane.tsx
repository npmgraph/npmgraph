import React, { useEffect, useState } from 'react';
import simplur from 'simplur';
import Module from '../../lib/Module.js';
import fetchJSON from '../../lib/fetchJSON.js';
import { BundlePhobiaData, NPMSIOData } from '../../lib/fetch_types.js';
import { ExternalLink } from '../ExternalLink.js';
import { Pane } from '../Pane.js';
import { QueryLink } from '../QueryLink.js';
import { Section } from '../Section.js';
import { Tag } from '../Tag.js';
import { Tags } from '../Tags.js';
import { ModuleBundleStats } from './ModuleBundleStats.js';
import { ModuleNpmsIOScores } from './ModuleNpmsIOScores.js';
import './ModulePane.scss';
import { ModuleTreeMap } from './ModuleTreeMap.js';

export default function ModulePane({
  module,
  ...props
}: { module?: Module } & React.HTMLAttributes<HTMLDivElement>) {
  const pkg = module?.package;

  const [bundleInfo, setBundleInfo] = useState<BundlePhobiaData | Error>();
  const [npmsData, setNpmsData] = useState<NPMSIOData | Error>();

  const pn = pkg ? encodeURIComponent(`${pkg.name}@${pkg.version}`) : null;
  const isLocalModule = Boolean(pkg?._local);

  useEffect(() => {
    if (isLocalModule) return;

    setBundleInfo(pkg ? undefined : Error('No package selected'));
    setNpmsData(undefined);

    if (!pkg) return;

    fetchJSON<BundlePhobiaData>(
      `https://bundlephobia.com/api/size?package=${pn}`,
    )
      .then(data => setBundleInfo(data))
      .catch(err => setBundleInfo(err));

    fetchJSON<NPMSIOData>(
      `https://api.npms.io/v2/package/${encodeURIComponent(pkg.name)}`,
    )
      .then(data => setNpmsData(data))
      .catch(err => setNpmsData(err));
  }, [pkg]);

  if (!pkg) {
    return (
      <Pane>
        No module selected. Click a module in the graph to see details.
      </Pane>
    );
  } else if (isLocalModule) {
    return (
      <Pane>
        <h2>{module.key}</h2>
        <p>
          This is a locally-defined module. Additional information is not
          available at this time.
        </p>
      </Pane>
    );
  }

  if (pkg._stub) {
    return (
      <Pane>
        <h2>{module.name}</h2>
        <p>
          Information and dependencies for this module cannot be displayed due
          to the following error:
        </p>
        <p style={{ color: 'red', fontWeight: 'bold' }}>
          {pkg._stubError?.message}
        </p>
      </Pane>
    );
  }

  const bpUrl = `https://bundlephobia.com/result?p=${pn}`;

  const maintainers = module.maintainers;

  return (
    <Pane {...props}>
      <h2>
        <QueryLink query={module.key} />
      </h2>

      {pkg.deprecated ? (
        <div
          className="warning"
          style={{ padding: '.5em', borderRadius: '.5em' }}
        >
          <h2 style={{ color: 'darkred', marginTop: 0 }}>Deprecated Module</h2>
          {pkg.deprecated}
        </div>
      ) : null}

      <p>{pkg?.description}</p>

      {/* For NPM packages */}
      {!module.package._local ? (
        <>
          <ExternalLink href={module.packageJsonLink}>
            package.json
          </ExternalLink>
          <ExternalLink href={module.npmLink} style={{ marginRight: '1em' }}>
            npm
          </ExternalLink>
          {module.repoLink ? (
            <ExternalLink href={module.repoLink} style={{ marginRight: '1em' }}>
              GitHub
            </ExternalLink>
          ) : null}
        </>
      ) : null}

      <Section title="Bundle Size">
        {!bundleInfo ? (
          'Loading ...'
        ) : bundleInfo instanceof Error ? (
          'Unavailable'
        ) : (
          <>
            <ModuleBundleStats bundleInfo={bundleInfo} />
            <ModuleTreeMap
              style={{ height: '150px', margin: '1em' }}
              data={bundleInfo}
            />
            Data source: <ExternalLink href={bpUrl}>BundlePhobia</ExternalLink>
          </>
        )}
      </Section>

      <Section title="npms.io Score">
        {!npmsData ? (
          'Loading'
        ) : npmsData instanceof Error ? (
          'Unavailable'
        ) : (
          <ModuleNpmsIOScores scores={npmsData.score} />
        )}
      </Section>

      <Section
        title={simplur`${Object.entries(maintainers).length} Maintainer[|s]`}
      >
        <Tags>
          {maintainers.map(({ name = 'Unknown', email }) => (
            <Tag
              key={name + email}
              type="maintainer"
              value={name}
              gravatar={email}
            />
          ))}
        </Tags>
      </Section>
    </Pane>
  );
}
