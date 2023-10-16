import simplur from 'simplur';
import Module, { ModulePackage } from '../../lib/Module.js';
import { getModule } from '../../lib/ModuleCache.js';
import { getModuleKey } from '../../lib/module_util.js';

const FONT = 'Roboto Condensed, sans-serif';

const EDGE_ATTRIBUTES = {
  dependencies: '[color=black]',
  devDependencies: '[color=black]',
  peerDependencies:
    '[label=peer fontcolor="#bbbbbb" color="#bbbbbb" style=dashed]',
  optionalDependencies: '[color=black style=dashed]', // unused
  optionalDevDependencies: '[color=black style=dashed]', // unused
};

export type DependencyKey =
  | 'dependencies'
  | 'devDependencies'
  | 'peerDependencies'
  | 'optionalDependencies';

type DependencyEntry = {
  name: string;
  version: string;
  type: DependencyKey;
};

type Dependency = {
  module: Module;
  type: DependencyKey;
};

type GraphModuleInfo = {
  module: Module;
  level: number;
  upstream: Set<Dependency>;
  downstream: Set<Dependency>;
};

export type GraphState = {
  // Map of module key -> module info
  modules: Map<string, GraphModuleInfo>;

  entryModules: Set<Module>;
};

const DEPENDENCIES_ONLY = new Set<DependencyKey>(['dependencies']);

function getDependencyEntries(
  module: Module,
  dependencyTypes: Set<DependencyKey>,
  level = 0,
) {
  // We only add non-"dependencies" at the top-level.
  if (level > 0) dependencyTypes = DEPENDENCIES_ONLY;

  const depEntries = new Set<DependencyEntry>();
  for (const type of dependencyTypes) {
    const deps = module.package[type];
    if (!deps) continue;

    // Only do one level for non-"dependencies"
    if (level > 0 && type != 'dependencies') continue;

    // Get entries, adding type to each entry
    for (const [name, version] of Object.entries(deps)) {
      depEntries.add({ name, version, type });
    }
  }

  return depEntries;
}

/**
 * Fetch the module dependency tree for a given query.
 */
export async function getGraphForQuery(
  query: string[],
  dependencyTypes: Set<DependencyKey>,
  moduleFilter: (m: Module | ModulePackage) => boolean,
) {
  const graphState: GraphState = {
    modules: new Map(),
    entryModules: new Set(),
  };

  async function _visit(
    module: Module[] | Module,
    level = 0,
    walk = true,
  ): Promise<GraphModuleInfo | void> {
    if (!module) return Promise.reject(Error('Undefined module'));

    // Array?  Apply to each element
    if (Array.isArray(module)) {
      await Promise.all(module.map(m => _visit(m, level)));
      return;
    }

    let info: GraphModuleInfo | undefined = graphState.modules.get(module.key);
    if (info) {
      return info;
    }

    // Create object that captures info about how this module fits in the dependency graph
    info = {
      module,
      level,
      upstream: new Set(),
      downstream: new Set(),
    };
    graphState.modules.set(module.key, info);

    if (!walk) return info;

    // Get dependency entries
    const downstreamEntries = moduleFilter(module)
      ? getDependencyEntries(module, dependencyTypes, level)
      : new Set<DependencyEntry>();

    // Walk downstream dependencies
    await Promise.allSettled(
      [...downstreamEntries].map(async ({ name, version, type }) => {
        const downstreamModule = await getModule(getModuleKey(name, version));

        // Don't walk peerDependencies
        const moduleInfo = await _visit(
          downstreamModule,
          level + 1,
          type !== 'peerDependencies',
        );

        moduleInfo?.upstream.add({ module, type });
        info?.downstream.add({ module: downstreamModule, type });
      }),
    );

    return info;
  }

  // Walk dependencies of each module in the query
  return Promise.allSettled(
    query.map(async moduleKey => {
      const m = await getModule(moduleKey);
      graphState.entryModules.add(m);
      return m && _visit(m);
    }),
  ).then(() => graphState);
}

// Compose directed graph document (GraphViz notation)
export function composeDOT(graph: Map<string, GraphModuleInfo>) {
  // Sort modules by [level, key]
  const entries = [...graph.entries()];
  entries.sort(([aKey, a], [bKey, b]) => {
    if (a.level != b.level) {
      return a.level - b.level;
    } else {
      return aKey < bKey ? -1 : aKey > bKey ? 1 : 0;
    }
  });

  const nodes = ['\n// Nodes & per-node styling'];
  const edges = ['\n// Edges & per-edge styling'];

  for (const [, { module, level, downstream }] of entries) {
    nodes.push(`"${module}"${level == 0 ? ' [root=true]' : ''}`);
    if (!downstream) continue;
    for (const { module: dependency, type } of downstream) {
      edges.push(`"${module}" -> "${dependency}" ${EDGE_ATTRIBUTES[type]}`);
    }
  }

  const titleParts = entries
    .filter(([, m]) => m.level == 0)
    .map(([, m]) => m.module.name);

  const MAX_PARTS = 3;
  if (titleParts.length > MAX_PARTS) {
    titleParts.splice(
      MAX_PARTS,
      Infinity,
      simplur` and ${titleParts.length - MAX_PARTS} other module[|s]`,
    );
  }

  return [
    'digraph {',
    'rankdir="LR"',
    'labelloc="t"',
    `label="${titleParts.join(', ')}"`,
    '// Default styles',
    `graph [fontsize=16 fontname="${FONT}"]`,
    `node [shape=box style=rounded fontname="${FONT}" fontsize=11 height=0 width=0 margin=.04]`,
    `edge [fontsize=10, fontname="${FONT}" splines="polyline"]`,
    '',
  ]
    .concat(nodes)
    .concat(edges)
    .concat(
      graph.size > 1
        ? `{rank=same; ${[...graph.values()]
            .filter(info => info.level == 0)
            .map(info => `"${info.module}"`)
            .join('; ')};}`
        : '',
    )
    .concat('}')
    .join('\n');
}

export function gatherSelectionInfo(
  graphState: GraphState,
  selectedModules: IterableIterator<Module>,
) {
  // Gather *string* identifiers used to identify the various DOM elements that
  // represent the selection
  const selectedKeys = new Set<string>();
  const upstreamEdgeKeys = new Set<string>();
  const upstreamModuleKeys = new Set<string>();
  const downstreamEdgeKeys = new Set<string>();
  const downstreamModuleKeys = new Set<string>();

  function _visitUpstream(fromModule: Module, visited = new Set<Module>()) {
    if (visited.has(fromModule)) return;
    visited.add(fromModule);

    const info = graphState.modules.get(fromModule.key);
    if (!info) return;

    for (const { module } of info.upstream) {
      upstreamModuleKeys.add(module.key);
      upstreamEdgeKeys.add(`${module.key}->${fromModule.key}`);
      _visitUpstream(module, visited);
    }
  }

  function _visitDownstream(fromModule: Module, visited = new Set<Module>()) {
    if (visited.has(fromModule)) return;
    visited.add(fromModule);

    const info = graphState.modules.get(fromModule.key);
    if (!info) return;

    for (const { module } of info.downstream) {
      downstreamModuleKeys.add(module.key);
      downstreamEdgeKeys.add(`${fromModule.key}->${module.key}`);
      _visitDownstream(module, visited);
    }
  }

  for (const selectedModule of selectedModules) {
    selectedKeys.add(selectedModule.key);
    _visitUpstream(selectedModule);
    _visitDownstream(selectedModule);
  }

  return {
    selectedKeys,
    upstreamEdgeKeys,
    upstreamModuleKeys,
    downstreamEdgeKeys,
    downstreamModuleKeys,
  };
}

// Use color-mix to blend two colors in HSL space
export function hslFor(perc: number) {
  return `hsl(${Math.round(perc * 120)}, 80%, var(--bg-L))`;
}
