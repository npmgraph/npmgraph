import { Suspense, use, useDeferredValue, useMemo } from 'react';
import { QueryType } from '../../../lib/ModuleCache.ts';
import fetchJson from '../../../lib/fetchJson.ts';
import { ExternalLink } from '../../ui/ExternalLink.tsx';
import { Row, Rows } from '../../ui/Row.tsx';
import { Selectable } from '../../ui/Selectable.tsx';
import type { ModuleAnalysisState } from '../analyzers/analyzeModules.ts';
import { useModuleAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';
import * as styles from './ModuleVulnerabilities.module.css';

const SEVERITY_RANK = {
  none: 0,
  info: 1,
  low: 2,
  moderate: 3,
  high: 4,
  critical: 5,
};

type Advisory = {
  packageName?: string;
  id: number;
  url: string;
  title: string;
  severity: 'none' | 'info' | 'low' | 'moderate' | 'high' | 'critical';
  vulnerable_versions: string;
  cwe: string[]; // CWE codes
  cvss: { score: number; vectorString: string };
};

async function fetchAdvisories({ moduleInfos }: ModuleAnalysisState) {
  type BulkAdvisories = Record<string, Advisory[]>;
  const versionsByName: Record<string, string[]> = {};

  let nModules = 0;
  for (const { module } of moduleInfos.values()) {
    versionsByName[module.name] ??= [];
    (versionsByName[module.name] ??= []).push(module.version);
    nModules++;
  }

  let moduleAdvisories: BulkAdvisories | null = null;
  if (nModules > 0) {
    const body = JSON.stringify(versionsByName, null, 2);

    // Ideally we'd be using `getRegistry()` here, but due to CORS issues with the
    // npmjs.org registry endpoint, we have to use our own proxy lambda instead.
    const registry =
      'https://pcwyqhjns4xzfybfy6grsq3if40sccxu.lambda-url.us-west-2.on.aws';

    moduleAdvisories = await fetchJson<BulkAdvisories>(
      `${registry}/-/npm/v1/security/advisories/bulk`,
      {
        headers: {
          Accept: 'application/json',
        },
        method: 'POST',
        body,
      },
    ).catch(error => {
      console.log('Error fetching NPM audit data:', error.message);
      return null;
    });
  }

  // Get flat list of advisories
  const advisories: Advisory[] = [];
  if (moduleAdvisories) {
    for (const [moduleName, moduleAdvisory] of Object.entries(
      moduleAdvisories,
    )) {
      for (const adv of moduleAdvisory) {
        adv.packageName = moduleName;
        advisories.push(adv);
      }
    }
  }

  // Sort by severity, name
  advisories.sort((a, b) => {
    const rank = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
    return rank === 0
      ? (a.packageName ?? '').localeCompare(b.packageName ?? '')
      : rank;
  });

  return advisories;
}

function AdvisoryRow({ advisory }: { advisory: Advisory }) {
  return (
    <Row
      stacked
      striped
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
    useMemo(() => fetchAdvisories(analysis), [analysis]),
  );

  return (
    <Suspense fallback={null}>
      <Vulnerabilities advisories={advisories} />
    </Suspense>
  );
}
