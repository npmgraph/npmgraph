import simplur from 'simplur';

import { cn } from '../../lib/dom.ts';
import useCollapse from '../../hooks/useCollapse.ts';
import { ExternalLink } from '../ui/ExternalLink.tsx';
import type { GraphState } from '../../lib/graph-util.ts';
import { Pane } from '../ui/Pane.tsx';
import * as styles from './ReportPane.module.scss';
import { ReportItem } from './ReportItem.tsx';
import { analyzeLicenses } from './analyzers/analyzeLicenses.ts';
import { analyzeMaintainers } from './analyzers/analyzeMaintainers.tsx';
import { analyzeModules } from './analyzers/analyzeModules.ts';
import { analyzePeerDependencies } from './analyzers/analyzePeerDependencies.tsx';
import { licensesAll } from './reporters/licensesAll.tsx';
import { licensesKeyword } from './reporters/licensesKeyword.tsx';
import { licensesMissing } from './reporters/licensesMissing.tsx';
import { maintainersAll } from './reporters/maintainersAll.tsx';
import { maintainersSolo } from './reporters/maintainersSolo.tsx';
import { moduleReplacementsNative } from './reporters/moduleReplacements.tsx';
import { moduleVulnerabilities } from './reporters/moduleVulnerabilities.tsx';
import { modulesAll } from './reporters/modulesAll.tsx';
import { modulesDeprecated } from './reporters/modulesDeprecated.tsx';
import { modulesRepeated } from './reporters/modulesRepeated.tsx';
import {
  peerDependenciesAll,
  peerDependenciesMissing,
} from './reporters/peerDependenciesAll.tsx';

export default function ReportPane({
  graph,
  ...props
}: { graph: GraphState | undefined } & React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...restProps } = props;
  const [collapse, setCollapse] = useCollapse();

  if (!graph?.moduleInfos) {
    return <div>Loading</div>;
  }

  const moduleAnalysis = analyzeModules(graph);
  const peerDependencyAnalysis = analyzePeerDependencies(graph);
  const maintainersAnalysis = analyzeMaintainers(graph);
  const licensesAnalysis = analyzeLicenses(graph);

  return (
    <Pane className={cn(styles.paneGraph, className)} {...restProps}>
      <div className={styles.collapseInfo}>
        {collapse.length > 0 ? (
          <span>
            {simplur`${collapse.length} module[|s] collapsed `}
            <button
              type="button"
              onClick={() => {
                setCollapse([]);
              }}
            >
              Expand All
            </button>
          </span>
        ) : (
          <span>(Shift-click modules in graph to expand/collapse)</span>
        )}
      </div>

      <ReportItem data={moduleAnalysis} reporter={modulesAll} />

      <ReportItem
        data={peerDependencyAnalysis}
        reporter={peerDependenciesAll}
      />

      <ReportItem data={maintainersAnalysis} reporter={maintainersAll} />

      <ReportItem data={licensesAnalysis} reporter={licensesAll} />

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
      <ReportItem data={moduleAnalysis} reporter={moduleVulnerabilities}>
        Security advisories per <code>npm audit</code>. Data sourced from the
        npm registry. See{' '}
        <ExternalLink href="https://docs.npmjs.com/cli/v9/commands/npm-audit">
          npm audit documentation
        </ExternalLink>
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

      <ReportItem data={maintainersAnalysis} reporter={maintainersSolo}>
        Modules with a single maintainer are at risk of "unplanned abandonment".
        See{' '}
        <ExternalLink href="https://en.wikipedia.org/wiki/Bus_factor">
          Bus factor
        </ExternalLink>
        .
      </ReportItem>
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

      <ReportItem data={moduleAnalysis} reporter={moduleReplacementsNative}>
        From the{' '}
        <ExternalLink href="https://github.com/e18e/module-replacements">
          module-replacements
        </ExternalLink>{' '}
        project, these modules can be removed or replaced with more modern,
        streamlined alternatives
      </ReportItem>

      <ReportItem
        data={peerDependencyAnalysis}
        reporter={peerDependenciesMissing}
      />
    </Pane>
  );
}
