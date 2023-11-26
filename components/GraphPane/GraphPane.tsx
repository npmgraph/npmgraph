import React from 'react';
import simplur from 'simplur';
import useHashParam from '../../lib/useHashParam.js';

import { PARAM_DEPENDENCIES } from '../../lib/constants.js';
import { isDefined } from '../../lib/guards.js';
import useCollapse from '../../lib/useCollapse.js';
import { DependencyKey, GraphState } from '../GraphDiagram/graph_util.js';
import { Pane } from '../Pane.js';
import { Toggle } from '../Toggle.js';
import { AnalyzerSection } from './AnalyzerItem.js';
import ColorizeInput from './ColorizeInput.js';
import './GraphPane.scss';
import { allLicenses } from './analyzers/allLicenses.js';
import { allMaintainers } from './analyzers/allMaintainers.js';
import { allModules } from './analyzers/allModules.js';
import { deprecatedModules } from './analyzers/deprecatedModules.js';
import {
  discouragedLicenses,
  missingLicenses,
  obsoleteLicenses,
} from './analyzers/missingLicenses.js';
import { repeatedModules } from './analyzers/repeatedModules.js';
import { soloMaintainers } from './analyzers/soloMaintainers.js';

export default function GraphPane({
  graph,
  ...props
}: { graph: GraphState | null } & React.HTMLAttributes<HTMLDivElement>) {
  const [collapse, setCollapse] = useCollapse();
  const [depTypes, setDepTypes] = useHashParam(PARAM_DEPENDENCIES);

  const dependencyTypes = (
    (depTypes ?? '').split(/\s*,\s*/) as DependencyKey[]
  ).filter(isDefined);

  const includeDev = dependencyTypes.includes('devDependencies');
  if (!graph?.moduleInfos) return <div>Loading</div>;

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

      <h3>Licenses</h3>

      <AnalyzerSection graph={graph} analyzer={allLicenses} />
      <AnalyzerSection type="warn" graph={graph} analyzer={missingLicenses} />
      <AnalyzerSection
        type="warn"
        graph={graph}
        analyzer={discouragedLicenses}
      />
      <AnalyzerSection type="warn" graph={graph} analyzer={obsoleteLicenses} />
    </Pane>
  );
}
