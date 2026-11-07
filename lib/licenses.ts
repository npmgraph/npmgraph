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
};

export type SPDXLicenseList = {
  licenseListVersion: string;
  licenses: SPDXLicense[];
  releaseDate: string;
};

let cachedLicenses: Map<string, SPDXLicense> | null = null;

async function fetchSPDXLicenses(): Promise<Map<string, SPDXLicense>> {
  if (cachedLicenses) {
    return cachedLicenses;
  }

  try {
    const response = await fetch(SPDX_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch SPDX licenses: ${response.status}`);
    }

    const data: SPDXLicenseList = await response.json();
    cachedLicenses = new Map(
      data.licenses.map(license => [license.licenseId.toLowerCase(), license]),
    );

    return cachedLicenses;
  } catch (error) {
    console.warn(
      'Failed to fetch SPDX licenses, falling back to empty map',
      error,
    );
    cachedLicenses = new Map();
    return cachedLicenses;
  }
}

export async function getLicense(id: string): Promise<SPDXLicense | undefined> {
  const licenses = await fetchSPDXLicenses();
  return licenses.get(id.toLowerCase());
}

export async function getAllLicenses(): Promise<Map<string, SPDXLicense>> {
  return fetchSPDXLicenses();
}
