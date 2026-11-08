import fetchJson from '../../../lib/fetchJson.ts';

const SEVERITY_RANK = {
  none: 0,
  info: 1,
  low: 2,
  moderate: 3,
  high: 4,
  critical: 5,
};

export type Advisory = {
  packageName?: string;
  id: number;
  url: string;
  title: string;
  severity: 'none' | 'info' | 'low' | 'moderate' | 'high' | 'critical';
  vulnerable_versions: string;
  cwe: string[]; // CWE codes
  cvss: { score: number; vectorString: string };
};

export async function fetchAdvisories(
  versionsByName: Record<string, string[]>,
) {
  type BulkAdvisories = Record<string, Advisory[]>;

  let moduleAdvisories: BulkAdvisories | null = null;
  if (Object.keys(versionsByName).length > 0) {
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
