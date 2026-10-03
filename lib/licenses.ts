export type OSIKeyword =
  | 'osi-approved'
  | 'discouraged'
  | 'non-reusable'
  | 'redundant'
  | 'popular'
  | 'obsolete'
  | 'copyleft'
  | 'special-purpose'
  | 'permissive'
  | 'miscellaneous'
  | 'retired';

export type License = {
  // From SPDX list
  id: string;
  name: string;
  isOsiApproved?: true;
  isDeprecatedLicenseId?: true;

  // From OSI list
  keywords?: OSIKeyword[];
};

export type Licenses = Record<string, License>;
