import React from 'react';
import simplur from 'simplur';
import Module from '../../lib/Module.js';
import { ExternalLink } from '../ExternalLink.js';
import { GithubIcon } from '../Icons.js';
import { Pane } from '../Pane.js';
import { QueryLink } from '../QueryLink.js';
import { Section } from '../Section.js';
import { Tag } from '../Tag.js';
import { Tags } from '../Tags.js';
import ModuleBundleSize from './ModuleBundleSize.js';
import ModuleNpmsIOScores from './ModuleNpmsIOScores.js';
import './ModulePane.scss';

export default function ModulePane({
  selectedModules,
  ...props
}: {
  selectedModules?: Map<string, Module>;
} & React.HTMLAttributes<HTMLDivElement>) {
  const nSelected = selectedModules?.size ?? 0;
  if (nSelected == 0) {
    return (
      <Pane>
        No modules selected. Click a module in the graph to see details.
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
  const isLocalModule = Boolean(pkg?._local);

  if (isLocalModule) {
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
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <ExternalLink href={module.packageJsonLink}>
            package.json
          </ExternalLink>
          <ExternalLink href={module.npmLink} style={{ marginRight: '1em' }}>
            npmjs.org
          </ExternalLink>
          {module.repoLink ? (
            <ExternalLink
              href={module.repoLink}
              style={{ marginRight: '1em' }}
              icon={GithubIcon}
            >
              Project Page
            </ExternalLink>
          ) : null}
        </div>
      ) : null}

      <Section title="Bundle Size">
        <ModuleBundleSize module={module} />
      </Section>

      <Section title="npms.io Score">
        <ModuleNpmsIOScores module={module} />
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
