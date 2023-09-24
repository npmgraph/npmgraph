import React, { useEffect, useState } from 'react';
import { ExternalLink } from '../components/ExternalLink.js';
import { QueryLink } from '../components/QueryLink.js';
import { Section } from '../components/Section.js';
import { Tag } from '../components/Tag.js';
import { Tags } from '../components/Tags.js';
import Module from '../util/Module.js';
import fetchJSON from '../util/fetchJSON.js';
import { BundlePhobiaData, NPMSIOData } from '../util/fetch_types.js';
import simplur from '../util/simplur.js';
import { ModuleBundleStats } from './ModuleBundleStats.js';
import { ModuleNpmsIOScores } from './ModuleNpmsIOScores.js';
import { ModuleTreeMap } from './ModuleTreeMap.js';
import { Pane } from '../components/Pane.js';
import '/css/ModulePane.scss';

export default function ModulePane({
  module,
  ...props
}: { module?: Module } & React.HTMLAttributes<HTMLDivElement>) {
  const pkg = module?.package;

  const [bundleInfo, setBundleInfo] = useState<BundlePhobiaData | Error>();
  const [npmsData, setNpmsData] = useState<NPMSIOData | Error>();

  const pn = pkg ? encodeURIComponent(`${pkg.name}@${pkg.version}`) : null;

  useEffect(() => {
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

      <ExternalLink href={module.npmLink} style={{ marginRight: '1em' }}>
        npm
      </ExternalLink>
      {module.repoLink ? (
        <ExternalLink href={module.repoLink} style={{ marginRight: '1em' }}>
          GitHub
        </ExternalLink>
      ) : null}
      {
        // Displaying dropped package contents is a bit problematic, but we give it a shot here.
        module.package._local ? (
          <ExternalLink
            href={`data:text/json;base64,${btoa(
              JSON.stringify(module.package),
            )}`}
          >
            package.json
          </ExternalLink>
        ) : (
          <ExternalLink href={module.apiLink}>package.json</ExternalLink>
        )
      }

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
              name={name}
              type="maintainer"
              gravatar={email}
            />
          ))}
        </Tags>
      </Section>
    </Pane>
  );
}
