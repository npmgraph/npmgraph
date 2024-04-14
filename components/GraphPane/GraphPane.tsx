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
import { AnalyzerItem2 } from './AnalyzerItem.js';
import ColorizeInput from './ColorizeInput.js';
import './GraphPane.scss';
import { analyzeLicenses } from './analysis/analyzeLicenses.js';
import { analyzeMaintainers } from './analysis/analyzeMaintainers.js';
import { analyzeModules } from './analysis/analyzeModules.js';
import { analyzePeerDependencies } from './analysis/analyzePeerDependencies.js';
import { licensesRenderAll } from './analysis/renderers/licensesRenderAll.js';
import { licensesRenderKeyword } from './analysis/renderers/licensesRenderKeyword.js';
import { licensesRenderMissing } from './analysis/renderers/licensesRenderMissing.js';
import { maintainersRenderAll } from './analysis/renderers/maintainersRenderAll.js';
import { maintainersRenderSolo } from './analysis/renderers/maintainersRenderSolo.js';
import { renderAllModules } from './analysis/renderers/modulesRenderAll.js';
import { modulesRenderDeprecated } from './analysis/renderers/modulesRenderDeprecated.js';
import { modulesRenderRepeated } from './analysis/renderers/modulesRenderRepeated.js';
import { peerDependenciesRenderAll } from './analysis/renderers/peerDependenciesRenderAll.js';

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

  const moduleAnalysis = analyzeModules(graph);
  const peerDependencyAnalysis = analyzePeerDependencies(graph);
  const maintainersAnalysis = analyzeMaintainers(graph);
  const licensesAnalysis = analyzeLicenses(graph);

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

      <AnalyzerItem2 state={moduleAnalysis} renderer={renderAllModules} />

      <AnalyzerItem2 state={moduleAnalysis} renderer={modulesRenderRepeated}>
        Module repetition is a result of incompatible version constraints, and
        may lead to increased bundle and <code>node_modules</code> directory
        size. Consider asking <em>upstream</em> module owners to update to the
        latest version or loosen the version constraint.
      </AnalyzerItem2>

      <AnalyzerItem2 state={moduleAnalysis} renderer={modulesRenderDeprecated}>
        Deprecated modules are unsupported and may have unpatched security
        vulnerabilities. See the deprecation notes below for module-specific
        instructions.
      </AnalyzerItem2>

      <h3>Peer Dependencies</h3>

      <AnalyzerItem2
        state={peerDependencyAnalysis}
        renderer={peerDependenciesRenderAll}
      />

      <h3>Maintainers</h3>

      <AnalyzerItem2
        state={maintainersAnalysis}
        renderer={maintainersRenderAll}
      />

      <AnalyzerItem2
        state={maintainersAnalysis}
        renderer={maintainersRenderSolo}
      >
        Modules with a single maintainer are at risk of "unplanned abandonment".
        See{' '}
        <ExternalLink href="https://en.wikipedia.org/wiki/Bus_factor">
          Bus factor
        </ExternalLink>
        .
      </AnalyzerItem2>

      <h3>Licenses</h3>

      <AnalyzerItem2 state={licensesAnalysis} renderer={licensesRenderAll} />

      <AnalyzerItem2
        type="warn"
        state={licensesAnalysis}
        renderer={licensesRenderMissing}
      >
        Modules without a declared license, or that are explicitely
        "UNLICENSED", are not opensource and may infringe on the owner's
        copyright. Consider contacting the owner to clarify licensing terms.
      </AnalyzerItem2>

      <AnalyzerItem2
        type="warn"
        state={licensesAnalysis}
        renderer={licensesRenderKeyword('discouraged')}
      >
        "Discouraged" licenses typically have a more popular alternative. See{' '}
        <ExternalLink href="https://opensource.org/licenses/">
          OSI Licenses
        </ExternalLink>
        .
      </AnalyzerItem2>

      <AnalyzerItem2
        type="warn"
        state={licensesAnalysis}
        renderer={licensesRenderKeyword('obsolete')}
      >
        "Obsolete" licenses have a newer version available. Consider asking the
        module owner to update to a more recent version. See{' '}
        <ExternalLink href="https://opensource.org/licenses/">
          OSI Licenses
        </ExternalLink>
        .
      </AnalyzerItem2>
    </Pane>
  );
}
