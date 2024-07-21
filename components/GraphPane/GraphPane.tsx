import React from 'react';
import { ExternalLink } from '../ExternalLink.js';
import { GraphState } from '../GraphDiagram/graph_util.js';
import { Pane } from '../Pane.js';
import './GraphPane.scss';
import { ReportItem } from './reports/ReportItem.js';
import { analyzeLicenses } from './reports/analyzeLicenses.js';
import { analyzeMaintainers } from './reports/analyzeMaintainers.js';
import { analyzeModules } from './reports/analyzeModules.js';
import { analyzePeerDependencies } from './reports/analyzePeerDependencies.js';
import { licensesAll } from './reports/reporters/licensesAll.js';
import { licensesKeyword } from './reports/reporters/licensesKeyword.js';
import { licensesMissing } from './reports/reporters/licensesMissing.js';
import { maintainersAll } from './reports/reporters/maintainersAll.js';
import { maintainersSolo } from './reports/reporters/maintainersSolo.js';
import { modulesAll } from './reports/reporters/modulesAll.js';
import { modulesDeprecated } from './reports/reporters/modulesDeprecated.js';
import { modulesRepeated } from './reports/reporters/modulesRepeated.js';
import {
  peerDependenciesAll,
  peerDependenciesMissing,
} from './reports/reporters/peerDependenciesAll.js';

export default function GraphPane({
  graph,
  ...props
}: { graph: GraphState | null } & React.HTMLAttributes<HTMLDivElement>) {
  if (!graph?.moduleInfos) return <div>Loading</div>;

  const moduleAnalysis = analyzeModules(graph);
  const peerDependencyAnalysis = analyzePeerDependencies(graph);
  const maintainersAnalysis = analyzeMaintainers(graph);
  const licensesAnalysis = analyzeLicenses(graph);

  return (
    <Pane {...props}>
      <h3>Modules</h3>

      <ReportItem data={moduleAnalysis} reporter={modulesAll} />

      <ReportItem data={moduleAnalysis} reporter={modulesRepeated}>
        Module repetition is a result of incompatible version constraints, and
        may lead to increased bundle and <code>node_modules</code> directory
        size. Consider asking <em>upstream</em> module owners to update to the
        latest version or loosen the version constraint.
      </ReportItem>

      <ReportItem data={moduleAnalysis} reporter={modulesDeprecated}>
        Deprecated modules are unsupported and may have unpatched security
        vulnerabilities. See the deprecation notes below for module-specific
        instructions.
      </ReportItem>

      <ReportItem
        data={peerDependencyAnalysis}
        reporter={peerDependenciesAll}
      />

      <ReportItem
        data={peerDependencyAnalysis}
        reporter={peerDependenciesMissing}
      />

      <h3>Maintainers</h3>

      <ReportItem data={maintainersAnalysis} reporter={maintainersAll} />

      <ReportItem data={maintainersAnalysis} reporter={maintainersSolo}>
        Modules with a single maintainer are at risk of "unplanned abandonment".
        See{' '}
        <ExternalLink href="https://en.wikipedia.org/wiki/Bus_factor">
          Bus factor
        </ExternalLink>
        .
      </ReportItem>

      <h3>Licenses</h3>

      <ReportItem data={licensesAnalysis} reporter={licensesAll} />

      <ReportItem
        type="warn"
        data={licensesAnalysis}
        reporter={licensesMissing}
      >
        Modules without a declared license, or that are explicitely
        "UNLICENSED", are not opensource and may infringe on the owner's
        copyright. Consider contacting the owner to clarify licensing terms.
      </ReportItem>

      <ReportItem
        type="warn"
        data={licensesAnalysis}
        reporter={licensesKeyword('discouraged')}
      >
        "Discouraged" licenses typically have a more popular alternative. See{' '}
        <ExternalLink href="https://opensource.org/licenses/">
          OSI Licenses
        </ExternalLink>
        .
      </ReportItem>

      <ReportItem
        type="warn"
        data={licensesAnalysis}
        reporter={licensesKeyword('obsolete')}
      >
        "Obsolete" licenses have a newer version available. Consider asking the
        module owner to update to a more recent version. See{' '}
        <ExternalLink href="https://opensource.org/licenses/">
          OSI Licenses
        </ExternalLink>
        .
      </ReportItem>
    </Pane>
  );
}
