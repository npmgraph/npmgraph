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

export type LicenseIssue = 'no-osi' | 'no-fsf' | 'deprecated';

let allLicensesPromise: Promise<Map<string, SPDXLicense>> | undefined;

// React renders again right after a failure, so retrying at once would loop
const RETRY_DELAY = 10_000;

async function fetchSPDXLicenses(): Promise<Map<string, SPDXLicense>> {
  try {
    type SPDXLicenseList = {
      licenseListVersion: string;
      licenses: SPDXLicense[];
      releaseDate: string;
    };

    const response = await fetch(SPDX_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: SPDXLicenseList = await response.json();
    return new Map(
      data.licenses.map(license => [license.licenseId.toLowerCase(), license]),
    );
  } catch (error) {
    // Keep the failure for a while, then let the next call try again
    setTimeout(() => {
      allLicensesPromise = undefined;
    }, RETRY_DELAY);
    throw error;
  }
}

// The same promise on every call, so `use()` doesn't suspend again
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
