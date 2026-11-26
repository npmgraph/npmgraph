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

export const getAllLicenses = pMemoize(
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
