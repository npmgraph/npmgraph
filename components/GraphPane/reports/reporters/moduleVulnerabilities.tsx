import simplur from 'simplur';
import { QueryType } from '../../../../lib/ModuleCache.js';
import { cn } from '../../../../lib/dom.js';
import fetchJSON from '../../../../lib/fetchJSON.js';
import { ExternalLink } from '../../../ExternalLink.js';
import { Selectable } from '../../../Selectable.js';
import type { RenderedAnalysis } from '../Analyzer.js';
import type { ModuleAnalysisState } from '../analyzeModules.js';
import * as styles from './moduleVulnerabilities.module.scss';

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

type BulkAdvisories = {
  [packageName: string]: Advisory[];
};

const SEVERITY_RANK = {
  none: 0,
  info: 1,
  low: 2,
  moderate: 3,
  high: 4,
  critical: 5,
};

export async function moduleVulnerabilities({
  moduleInfos,
}: ModuleAnalysisState) {
  const versionsByName: Record<string, string[]> = {};

  let nModules = 0;
  moduleInfos.forEach(({ module }) => {
    versionsByName[module.name] ??= [];
    versionsByName[module.name].push(module.version);
    nModules++;
  });

  let moduleAdvisories: BulkAdvisories | null = null;
  if (nModules > 0) {
    const body = JSON.stringify(versionsByName, null, 2);

    // Ideally we'd be using `getRegistry()` here, but due to CORS issues with the
    // npmjs.org registry endpoint, we have to use our own proxy lambda instead.
    const registry =
      'https://pcwyqhjns4xzfybfy6grsq3if40sccxu.lambda-url.us-west-2.on.aws';

    moduleAdvisories = await fetchJSON<BulkAdvisories>(
      `${registry}/-/npm/v1/security/advisories/bulk`,
      {
        headers: {
          Accept: 'application/json',
        },
        method: 'POST',
        body,
      },
    ).catch(err => {
      console.log('Error fetching NPM audit data:', err.message);
      return null;
    });
  }

  // Get flat list of advisories
  const advisories: Advisory[] = [];
  if (moduleAdvisories) {
    Object.entries(moduleAdvisories).forEach(([moduleName, moduleAdvisory]) => {
      for (const adv of moduleAdvisory) {
        adv.packageName = moduleName;
        advisories.push(adv);
      }
    });
  }

  // sort by severity, name
  advisories.sort((a, b) => {
    const rank = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
    if (rank !== 0) return rank;
    return (a.packageName ?? '').localeCompare(b.packageName ?? '');
  });

  const details = advisories.map(advisory => {
    return (
      <div key={advisory.id}>
        <div
          className={cn(
            styles.header,
            styles.severity,
            styles[advisory.severity as keyof typeof styles] as string,
          )}
        >
          <span className={styles.module}>
            <Selectable
              className={styles.name}
              type={QueryType.Default}
              value={`${advisory.packageName}@${advisory.vulnerable_versions}`}
            />{' '}
          </span>
          <span className={styles.severity}>{advisory.severity}</span>
        </div>
        <div>
          {advisory.title}{' '}
          <ExternalLink href={advisory.url}>details</ExternalLink>
        </div>
      </div>
    );
  });

  if (details.length <= 0) return;

  const summary = simplur`Vulnerabilities (${details.length})`;

  return { type: 'warn', summary, details } as RenderedAnalysis;
}
