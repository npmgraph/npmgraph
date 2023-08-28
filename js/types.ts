import Module from './Module.js';

export type Person = {
  name: string;
  email: string;
};

export type OldLicense = {
  type: string;
  url: string;
};

export type DependencyKey =
  | 'dependencies'
  | 'devDependencies'
  | 'peerDependencies'
  | 'optionalDependencies';

// Empirically determined type for what registry.npmjs.org returns
//
// TODO: Switch to the official type(s) from https://github.com/npm/types
export type ModuleInfo = {
  // Internal properties used by npmgraph
  _stub?: boolean;
  _dropped?: boolean;
  _stubError?: Error;

  author?: Person;
  bugs?: { url: string };
  contributors?: Person[];
  dependencies?: { [name: string]: string };
  deprecated?: string;
  description?: string;
  devDependencies?: { [name: string]: string };
  'dist-tags': { [tag: string]: string };
  homepage?: string;
  keywords?: string[];
  license?: string;
  licenses?: OldLicense[];
  maintainers?: Person[];
  name: string;
  optionalDependencies?: { [name: string]: string };
  peerDependencies?: { [name: string]: string };
  repository?: { type: 'git'; url: string };
  unpublished?: boolean;
  version: string;
  versions?: ModuleInfo[]; // versionless modules
};

export type GraphModuleInfo = {
  module: Module;
  level: number;
  dependencies?: {
    module: Module;
    type: DependencyKey;
  }[];
};

export type GraphState = {
  // Map of module key -> module info
  modules: Map<string, GraphModuleInfo>;

  // Upstream dependency types for each module
  referenceTypes: Map<string, Set<string>>;
};
