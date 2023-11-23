import { Maintainer } from '@npm/types';
import React from 'react';
import simplur from 'simplur';
import useHashParam from '../../lib/useHashParam.js';

import { PARAM_DEPENDENCIES } from '../../lib/constants.js';
import { isDefined } from '../../lib/guards.js';
import useCollapse from '../../lib/useCollapse.js';
import { DependencyKey, GraphState } from '../GraphDiagram/graph_util.js';
import { Pane } from '../Pane.js';
import { PieGraph } from '../PieGraph.js';
import { Section } from '../Section.js';
import { Tag } from '../Tag.js';
import { Tags } from '../Tags.js';
import { Toggle } from '../Toggle.js';
import { AnalyzerSection } from './AnalyzerItem.js';
import ColorizeInput from './ColorizeInput.js';
import './GraphPane.scss';
import { allMaintainers } from './analyzers/allMaintainers.js';
import { allModules } from './analyzers/allModules.js';
import { deprecatedModules } from './analyzers/deprecatedModules.js';
import { repeatedModules } from './analyzers/repeatedModules.js';
import { soloMaintainers } from './analyzers/soloMaintainers.js';

export default function GraphPane({
  graph,
  ...props
}: { graph: GraphState | null } & React.HTMLAttributes<HTMLDivElement>) {
  const compareEntryKey = ([a]: [string, unknown], [b]: [string, unknown]) =>
    a < b ? -1 : a > b ? 1 : 0;
  const [collapse, setCollapse] = useCollapse();
  const [depTypes, setDepTypes] = useHashParam(PARAM_DEPENDENCIES);

  const dependencyTypes = (
    (depTypes ?? '').split(/\s*,\s*/) as DependencyKey[]
  ).filter(isDefined);

  const includeDev = dependencyTypes.includes('devDependencies');
  if (!graph?.moduleInfos) return <div>Loading</div>;

  const occurances: { [key: string]: number } = {};
  const maintainers: {
    [key: string]: Exclude<Maintainer, string> & { count?: number };
  } = {};
  const licenseCounts: { [key: string]: number } = {};

  for (const { module } of graph.moduleInfos.values()) {
    const { package: pkg, licenseString: license } = module;
    // Tally module occurances
    occurances[pkg.name] = (occurances[pkg.name] || 0) + 1;

    // Tally maintainers
    for (const { name, email } of module.maintainers) {
      if (!name) continue;
      const maints = name && maintainers[name];

      if (!maints) {
        maintainers[name] = { name, email, count: 1 };
      } else {
        maints.count = (maints.count ?? 0) + 1;
      }
    }

    // Tally licenses
    if (license) {
      licenseCounts[license] = (licenseCounts[license] || 0) + 1;
    }
  }

  const licenses = Object.entries(licenseCounts)
    .sort(compareEntryValue)
    .reverse();

  return (
    <Pane {...props}>
      <Toggle
        checked={includeDev}
        style={{ marginTop: '1rem' }}
        onChange={() => setDepTypes(includeDev ? '' : 'devDependencies')}
      >
        Include devDependencies
      </Toggle>

      <ColorizeInput />

      <div
        style={{
          fontSize: '90%',
          color: 'var(--text-dim)',
          marginTop: '1em',
        }}
      >
        {collapse.length ? (
          <span>
            {simplur`${collapse.length} module[|s] collapsed `}
            <button onClick={() => setCollapse([])}>Expand All</button>
          </span>
        ) : (
          <span>(Shift-click modules in graph to expand/collapse)</span>
        )}
      </div>

      <h3>Modules</h3>

      <AnalyzerSection graph={graph} analyzer={allModules} />

      <AnalyzerSection type="warn" graph={graph} analyzer={repeatedModules} />

      <AnalyzerSection type="warn" graph={graph} analyzer={deprecatedModules} />

      <h3>Maintainers</h3>

      <AnalyzerSection graph={graph} analyzer={allMaintainers} />

      <AnalyzerSection type="warn" graph={graph} analyzer={soloMaintainers} />

      <Section title={simplur`${licenses.length} License[|s]`}>
        <Tags>
          {licenses.map(([value, count]) => (
            <Tag
              key={value + count}
              type="license"
              value={value}
              count={count}
            />
          ))}
        </Tags>

        {licenses.length > 1 ? (
          <PieGraph
            style={{ width: '100%', height: '200px', padding: '1em 0' }}
            entries={licenses}
          />
        ) : null}
      </Section>
    </Pane>
  );
}

function compareEntryValue<T = string | number>(
  [, a]: [string, T],
  [, b]: [string, T],
) {
  return a < b ? -1 : a > b ? 1 : 0;
}
