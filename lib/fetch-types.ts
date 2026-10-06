export type BundlePhobiaData = {
  assets: Array<{
    gzip: number;
    name: string;
    size: number;
    type: string;
  }>;
  dependencyCount: number;
  // dependencySizes may be undefined, but making it optional here causes TS to
  // complain when trying to pick it's type of this structure with
  // `BundlePhobiaData['dependencySizes'][number]`.
  dependencySizes: Array<{ approximateSize: number; name: string }>;
  description: string;
  gzip: number;
  hasJSModule: boolean;
  hasJSNext: boolean;
  hasSideEffects: boolean;
  isModuleType: boolean;
  name: string;
  repository: string;
  scoped: boolean;
  size: number;
  version: string;
};
