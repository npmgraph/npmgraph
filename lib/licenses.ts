import pMemoize from 'p-memoize';

export const SPDX_URL =
  'https://raw.githubusercontent.com/spdx/license-list-data/main/json/licenses.json';

export type SPDXLicense = {
  reference: string;
  isDeprecatedLicenseId: boolean;
  detailsUrl: string;
  referenceNumber: number;
  name: string;
  licenseId: string;
  seeAlso: string[];
  isOsiApproved: boolean;
  isFsfLibre?: boolean;
};

export type SPDXLicenseList = {
  licenseListVersion: string;
  licenses: SPDXLicense[];
  releaseDate: string;
};

export type LicenseIssue = 'no-osi' | 'no-fsf' | 'deprecated';

const fetchSPDXLicenses = pMemoize(
  async (): Promise<Map<string, SPDXLicense>> => {
    try {
      const response = await fetch(SPDX_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch SPDX licenses: ${response.status}`);
      }

      const data: SPDXLicenseList = await response.json();
      return new Map(
        data.licenses.map(license => [
          license.licenseId.toLowerCase(),
          license,
        ]),
      );
    } catch (error) {
      console.warn(
        'Failed to fetch SPDX licenses, falling back to empty map',
        error,
      );
      return new Map();
    }
  },
);

export async function getLicense(id: string): Promise<SPDXLicense | undefined> {
  const licenses = await fetchSPDXLicenses();
  return licenses.get(id.toLowerCase());
}

let allLicensesPromise: Promise<Map<string, SPDXLicense>> | undefined;

// The same promise on every call (a memoized function returns a new one once it settled), so `use()` doesn't suspend again
// eslint-disable-next-line @typescript-eslint/promise-function-async -- It must return the same promise on every call
export function getAllLicenses(): Promise<Map<string, SPDXLicense>> {
  allLicensesPromise ??= fetchSPDXLicenses();
  return allLicensesPromise;
}

export function getLicenseIssues(spdxLicense: SPDXLicense): LicenseIssue[] {
  const issues: LicenseIssue[] = [];

  if (!spdxLicense.isOsiApproved) {
    issues.push('no-osi');
  }

  if (spdxLicense.isFsfLibre === false) {
    issues.push('no-fsf');
  }

  if (spdxLicense.isDeprecatedLicenseId) {
    issues.push('deprecated');
  }

  return issues;
}
