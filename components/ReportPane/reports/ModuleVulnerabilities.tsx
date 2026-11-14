import { Suspense, use, useDeferredValue, useMemo } from 'react';
import { QueryType } from '../../../lib/ModuleCache.ts';
import { ExternalLink } from '../../ui/ExternalLink.tsx';
import { Row, Rows } from '../../ui/Row.tsx';
import { Selectable } from '../../ui/Selectable.tsx';
import type { ModuleAnalysisState } from '../analyzers/analyzeModules.ts';
import { useModuleAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';
import { fetchAdvisories, type Advisory } from './advisories.ts';
import * as styles from './ModuleVulnerabilities.module.css';

function getVersionsByName({ moduleInfos }: ModuleAnalysisState) {
  const versionsByName: Record<string, string[]> = {};

  for (const { module } of moduleInfos.values()) {
    versionsByName[module.name] ??= [];
    (versionsByName[module.name] ??= []).push(module.version);
  }

  return versionsByName;
}

export function AdvisoryRow({ advisory }: { advisory: Advisory }) {
  return (
    <Row
      stacked
      className={styles[advisory.severity as keyof typeof styles] as string}
    >
      <div className={styles.header}>
        <Selectable
          type={QueryType.Default}
          value={`${advisory.packageName}@${advisory.vulnerable_versions}`}
        />
        <span className={styles.severity}>{advisory.severity}</span>
      </div>
      <div>
        {advisory.title}{' '}
        <ExternalLink href={advisory.url}>details</ExternalLink>
      </div>
    </Row>
  );
}

function Vulnerabilities({
  advisories: advisoriesPromise,
}: {
  advisories: Promise<Advisory[]>;
}) {
  const advisories = use(advisoriesPromise);

  if (advisories.length === 0) {
    return null;
  }

  return (
    <ReportItem
      type="warn"
      title="Vulnerabilities"
      count={advisories.length}
      description={
        <>
          Security advisories per <code>npm audit</code>. Data sourced from the
          npm registry. See{' '}
          <ExternalLink href="https://docs.npmjs.com/cli/v9/commands/npm-audit">
            npm audit documentation
          </ExternalLink>
        </>
      }
    >
      <Rows>
        {advisories.map(advisory => (
          <AdvisoryRow key={advisory.id} advisory={advisory} />
        ))}
      </Rows>
    </ReportItem>
  );
}

export default function ModuleVulnerabilities() {
  const analysis = useModuleAnalysis();
  // The request is made here, outside of the suspending component, so that it
  // isn't made again when that one suspends. The deferred promise keeps the
  // previous advisories (and the open state) on screen while the next ones load
  const advisories = useDeferredValue(
    // eslint-disable-next-line @typescript-eslint/promise-function-async -- useMemo() can't take an async callback
    useMemo(() => fetchAdvisories(getVersionsByName(analysis)), [analysis]),
  );

  return (
    <Suspense fallback={null}>
      <Vulnerabilities advisories={advisories} />
    </Suspense>
  );
}
