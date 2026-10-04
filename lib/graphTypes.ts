import type Module from './Module.ts';

export type DependencyKey =
  | 'dependencies'
  | 'devDependencies'
  | 'peerDependencies'
  | 'optionalDependencies';

export type DependencyEntry = {
  name: string;
  version: string;
  type: DependencyKey;
};

type Dependency = {
  module: Module;
  type: DependencyKey;
};

export type GraphModuleInfo = {
  module: Module;
  level: number;
  upstream: Set<Dependency>;
  downstream: Set<Dependency>;
};

export type GraphState = {
  // Map of module key -> module info
  moduleInfos: Map<string, GraphModuleInfo>;

  entryModules: Set<Module>;

  // Map of module key -> error for entry modules that failed to load
  failedEntryModules: Map<string, Error>;
};
