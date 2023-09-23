import Module from './Module.js';

import * as npm from '@npm/types';

export type OldLicense = {
  type: string;
  url: string;
};

export type DependencyKey =
  | 'dependencies'
  | 'devDependencies'
  | 'peerDependencies'
  | 'optionalDependencies';

export interface ModulePackage extends npm.PackumentVersion {
  _stub?: boolean;
  _dropped?: boolean;
  _stubError?: Error;
}

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

  // Map of module key -> Set<dependency type that terminates in that module>
  referenceTypes: Map<string, Set<string>>;
};
