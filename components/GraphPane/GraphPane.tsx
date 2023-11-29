import React from 'react';
import simplur from 'simplur';
import useHashParam from '../../lib/useHashParam.js';

import { PARAM_DEPENDENCIES } from '../../lib/constants.js';
import { isDefined } from '../../lib/guards.js';
import useCollapse from '../../lib/useCollapse.js';
import { ExternalLink } from '../ExternalLink.js';
import { DependencyKey, GraphState } from '../GraphDiagram/graph_util.js';
import { Pane } from '../Pane.js';
import { Toggle } from '../Toggle.js';
import { AnalyzerItem } from './AnalyzerItem.js';
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

      <AnalyzerItem graph={graph} analyzer={allModules} />

      <AnalyzerItem type="warn" graph={graph} analyzer={repeatedModules}>
        Module repetition is a result of incompatible version constraints, and
        may lead to increased bundle and <code>node_modules</code> directory
        size. Consider asking <em>upstream</em> module owners to update to the
        latest version or loosen the version constraint.
      </AnalyzerItem>

      <AnalyzerItem type="warn" graph={graph} analyzer={deprecatedModules}>
        Deprecated modules are unsupported and may have unpatched security
        vulnerabilities. See the deprecation notes below for module-specific
        instructions.
      </AnalyzerItem>

      <h3>Maintainers</h3>

      <AnalyzerItem graph={graph} analyzer={allMaintainers} />

      <AnalyzerItem type="warn" graph={graph} analyzer={soloMaintainers}>
        Modules with fewer than 2 maintainers are at risk of "unplanned
        abandonment". See{' '}
        <ExternalLink href="https://en.wikipedia.org/wiki/Bus_factor">
          Bus factor
        </ExternalLink>
        .
      </AnalyzerItem>

      <h3>Licenses</h3>

      <AnalyzerItem graph={graph} analyzer={allLicenses} />

      <AnalyzerItem type="warn" graph={graph} analyzer={missingLicenses}>
        Modules without a declared license, or that are explicitely
        "UNLICENSED", are not opensource and may infringe on the owner's
        copyright. Consider contacting the owner to clarify licensing terms.
      </AnalyzerItem>

      <AnalyzerItem type="warn" graph={graph} analyzer={discouragedLicenses}>
        "Discouraged" licenses typically have a more popular alternative. See{' '}
        <ExternalLink href="https://opensource.org/licenses/">
          OSI Licenses
        </ExternalLink>
        .
      </AnalyzerItem>

      <AnalyzerItem type="warn" graph={graph} analyzer={obsoleteLicenses}>
        "Obsolete" licenses have a newer version available. Consider asking the
        module owner to update to a more recent version. See{' '}
        <ExternalLink href="https://opensource.org/licenses/">
          OSI Licenses
        </ExternalLink>
        .
      </AnalyzerItem>
    </Pane>
  );
}
