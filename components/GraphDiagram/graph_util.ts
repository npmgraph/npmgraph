import Module, { ModulePackage } from '../../lib/Module.js';
import { getModule } from '../../lib/ModuleCache.js';
import simplur from '../../lib/simplur.js';

const FONT = 'Roboto Condensed, sans-serif';

const EDGE_ATTRIBUTES = {
  dependencies: '[color=black]',
  devDependencies: '[color=red]',
  peerDependencies:
    '[label=peer fontcolor="#bbbbbb" color="#bbbbbb" style=dashed]',
  optionalDependencies: '[color=black style=dashed]', // unused
  optionalDevDependencies: '[color=red style=dashed]', // unused
};

type DependencyEntry = {
  name: string;
  version: string;
  type: DependencyKey;
};

type DependencyKey =
  | 'dependencies'
  | 'devDependencies'
  | 'peerDependencies'
  | 'optionalDependencies';

type GraphModuleInfo = {
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

  entryModules: Set<Module>;

  // Map of module -> types of dependencies that terminate in the module
  referenceTypes: Map<string, Set<DependencyKey>>;
};

export function getDependencyEntries(
  module: Module,
  includeDev: boolean,
  level = 0,
) {
  const dependencyTypes: DependencyKey[] = ['dependencies', 'peerDependencies'];
  if (includeDev && level <= 0) {
    dependencyTypes.push('devDependencies');
  }

  const depEntries: Array<DependencyEntry> = [];
  for (const type of dependencyTypes) {
    const deps = module.package[type];
    if (!deps) continue;

    // Only do one level for non-"dependencies"
    if (level > 0 && type != 'dependencies') continue;

    // Get entries, adding type to each entry
    for (const [name, version] of Object.entries(deps)) {
      depEntries.push({ name, version, type });
    }
  }

  return depEntries;
}

/**
 * Fetch the module dependency tree for a given query.
 *
 * @param {[String]} query names of module entry points
 * @param {Boolean} includeDev flag for including devDependencies
 * @param {Function} moduleFilter applied to module dependency list(s)
 * @returns {Promise<Map>} Map of key -> {module, level, dependencies}
 */
export async function getGraphForQuery(
  query: string[],
  includeDev: boolean,
  moduleFilter: (m: Module | ModulePackage) => boolean,
) {
  const graphState: GraphState = {
    modules: new Map(),
    entryModules: new Set(),
    referenceTypes: new Map(),
  };

  function _walk(module: Module[] | Module, level = 0): Promise<void> {
    if (!module) return Promise.reject(Error('Undefined module'));

    // Array?  Apply to each element
    if (Array.isArray(module)) {
      return Promise.all(module.map(m => _walk(m, level))).then();
    }

    // Skip modules we've already seen
    if (graphState.modules.has(module.key)) return Promise.resolve();

    // Get dependency [name, version, dependency type] entries
    const deps = moduleFilter(module)
      ? getDependencyEntries(module, includeDev, level)
      : [];

    // Create object that captures info about how this module fits in the dependency graph
    const info: GraphModuleInfo = { module: module, level };
    graphState.modules.set(module.key, info);

    // Walk all dependencies
    return Promise.all(
      deps.map(async ({ name, version, type }) => {
        const module = await getModule(Module.key(name, version));

        // Record dependency type in the module it terminates in
        let refTypes = graphState.referenceTypes.get(module.key);
        if (!refTypes) {
          graphState.referenceTypes.set(module.key, (refTypes = new Set()));
        }
        refTypes.add(type);

        // Don't walk peerDependencies
        if (type !== 'peerDependencies') {
          await _walk(module, level + 1);
        }
        return { module, type };
      }),
    )
      .then(dependencies => (info.dependencies = dependencies))
      .then();
  }

  // Walk dependencies of each module in the query
  return Promise.allSettled(
    query.map(async moduleKey => {
      const m = await getModule(moduleKey);
      graphState.entryModules.add(m);
      return m && _walk(m);
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

  for (const [, { module, level, dependencies }] of entries) {
    nodes.push(`"${module}"${level == 0 ? ' [root=true]' : ''}`);
    if (!dependencies) continue;
    for (const { module: dependency, type } of dependencies) {
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

// Use color-mix to blend two colors in HSL space
export function hslFor(perc: number) {
  return `color-mix(in hsl , var(--bg-red), var(--bg-green) ${Math.floor(
    perc * 100,
  )}%)`;
}
