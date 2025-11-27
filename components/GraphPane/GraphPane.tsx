import simplur from 'simplur';
import useHashParam from '../../lib/useHashParam.js';

import { PARAM_DEPENDENCIES, PARAM_SIZING } from '../../lib/constants.js';
import { isDefined } from '../../lib/guards.js';
import useCollapse from '../../lib/useCollapse.js';
import { ExternalLink } from '../ExternalLink.js';
import type { DependencyKey, GraphState } from '../GraphDiagram/graph_util.js';
import { Pane } from '../Pane.js';
import { Toggle } from '../Toggle.js';
import ColorizeInput from './ColorizeInput.js';
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
import { moduleReplacementsNative } from './reports/reporters/moduleReplacements.js';
import { modulesAge } from './reports/reporters/modulesAge.js';
import { modulesAll } from './reports/reporters/modulesAll.js';
import { modulesDeprecated } from './reports/reporters/modulesDeprecated.js';
import { modulesRepeated } from './reports/reporters/modulesRepeated.js';
import {
  peerDependenciesAll,
  peerDependenciesMissing,
} from './reports/reporters/peerDependenciesAll.js';

function ReportSection({ title, children }: { title: string; children: any }) {
  return (
    <div className="report-section">
      <hr />
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export default function GraphPane({
  graph,
  ...props
}: { graph: GraphState | null } & React.HTMLAttributes<HTMLDivElement>) {
  const [collapse, setCollapse] = useCollapse();
  const [depTypes, setDepTypes] = useHashParam(PARAM_DEPENDENCIES);
  const [sizing, setSizing] = useHashParam(PARAM_SIZING);

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

      <Toggle
        checked={sizing === ''}
        style={{ marginTop: '1rem' }}
        onChange={() => setSizing(sizing === null)}
      >
        Size modules by unpacked size
      </Toggle>

      <hr />

      <ColorizeInput />

      <div
        style={{ fontSize: '90%', color: 'var(--text-dim)', marginTop: '1em' }}
      >
        {collapse.length ? (
          <span>
            {simplur`${collapse.length} module[|s] collapsed `}
            <button onClick={() => setCollapse([])} type="button">
              Expand All
            </button>
          </span>
        ) : (
          <span>(Shift-click modules in graph to expand/collapse)</span>
        )}
      </div>

      <ReportSection title="Modules">
        <ReportItem data={moduleAnalysis} reporter={modulesAll} />

        <ReportItem data={moduleAnalysis} reporter={modulesAge}>
          Shows when each package was first created on npm. Older packages may
          have security vulnerabilities or lack modern features.
        </ReportItem>

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

        <ReportItem data={moduleAnalysis} reporter={moduleReplacementsNative}>
          From the{' '}
          <ExternalLink href="https://github.com/es-tooling/module-replacements">
            module-replacements
          </ExternalLink>{' '}
          project, these modules can be removed or replaced with more modern,
          streamlined alternatives
        </ReportItem>

        <ReportItem
          data={peerDependencyAnalysis}
          reporter={peerDependenciesAll}
        />

        <ReportItem
          data={peerDependencyAnalysis}
          reporter={peerDependenciesMissing}
        />
      </ReportSection>

      <ReportSection title="Maintainers">
        <ReportItem data={maintainersAnalysis} reporter={maintainersAll} />

        <ReportItem data={maintainersAnalysis} reporter={maintainersSolo}>
          Modules with a single maintainer are at risk of "unplanned
          abandonment". See{' '}
          <ExternalLink href="https://en.wikipedia.org/wiki/Bus_factor">
            Bus factor
          </ExternalLink>
          .
        </ReportItem>
      </ReportSection>
      <ReportSection title="Licenses">
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
          "Obsolete" licenses have a newer version available. Consider asking
          the module owner to update to a more recent version. See{' '}
          <ExternalLink href="https://opensource.org/licenses/">
            OSI Licenses
          </ExternalLink>
          .
        </ReportItem>
      </ReportSection>
    </Pane>
  );
}
