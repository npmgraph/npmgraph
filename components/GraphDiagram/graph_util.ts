import simplur from 'simplur';
import Module from '../../lib/Module.js';
import { getModule } from '../../lib/ModuleCache.js';
import { getModuleKey } from '../../lib/module_util.js';

const FONT = 'Roboto Condensed, sans-serif';

const DEFAULT_STYLES = {
  GRAPH: vizStyle({
    fontsize: 16,
    fontname: FONT,
  }),
  NODE: vizStyle({
    shape: 'box',
    style: 'rounded',
    fontname: FONT,
    fontsize: 11,
    height: 0,
    width: 0,
    margin: 0.04,
  }),
  EDGE: vizStyle({
    fontsize: 10,
    fontname: FONT,
    splines: 'polyline',
  }),
};

const EDGE_ATTRIBUTES = {
  dependencies: '[color=black]',
  devDependencies: '[color=black]',
  optionalDependencies: '[color=black style=dashed]', // unused
  optionalDevDependencies: '[color=black style=dashed]', // unused
};

export type DependencyKey =
  | 'dependencies'
  | 'devDependencies'
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
  moduleFilter: (m: Module) => boolean,
) {
  const graphState: GraphState = {
    moduleInfos: new Map(),
    entryModules: new Set(),
  };

  async function _visit(
    module: Module[] | Module,
    level = 0,
  ): Promise<GraphModuleInfo | void> {
    if (!module) return Promise.reject(Error('Undefined module'));

    // Array?  Apply to each element
    if (Array.isArray(module)) {
      await Promise.all(module.map(m => _visit(m, level)));
      return;
    }

    let info: GraphModuleInfo | undefined = graphState.moduleInfos.get(
      module.key,
    );
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
    graphState.moduleInfos.set(module.key, info);

    // Get dependency entries
    const downstreamEntries = moduleFilter(module)
      ? getDependencyEntries(module, dependencyTypes, level)
      : new Set<DependencyEntry>();

    // Walk downstream dependencies
    await Promise.allSettled(
      [...downstreamEntries].map(async ({ name, version, type }) => {
        const downstreamModule = await getModule(getModuleKey(name, version));

        const moduleInfo = await _visit(downstreamModule, level + 1);

        moduleInfo?.upstream.add({ module, type });
        info?.downstream.add({ module: downstreamModule, type });
      }),
    );

    return info;
  }

  // deep-resolve all modules in query
  await Promise.allSettled(
    query.map(async moduleKey => {
      const m = await getModule(moduleKey);
      graphState.entryModules.add(m);
      return m && _visit(m);
    }),
  );

  return graphState;
}

function dotEscape(str: string) {
  return str.replace(/"/g, '\\"');
}

/**
 * Creates a GraphViz style string from an object of key-value pairs.
 *
 * E.g. { shape: 'box', fontsize: 11 } -> '[shape="box" fontsize=11]'
 */
function vizStyle(obj: Record<string, string | number | boolean | undefined>) {
  const pairs = Object.entries(obj).map(function ([key, value]) {
    switch (typeof value) {
      case 'number':
        return `${key}=${value}`;
      case 'string':
        return `${key}="${value}"`;
      case 'boolean':
        return `${key}=${value ? 'true' : 'false'}`;
      case 'undefined':
        return '';
      default:
        throw new Error('Invalid value type');
    }
  });
  return `[${pairs.filter(Boolean).join(' ')}]`;
}

// Compose directed graph document (GraphViz notation)
export function composeDOT({
  graph,
  sizing,
}: {
  graph: GraphState;
  sizing?: boolean;
}) {
  // Sort modules by [level, key]
  const entries = [...graph.moduleInfos.entries()];
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
    let fontsize = 11;
    const { unpackedSize } = module;
    if (sizing && unpackedSize) {
      fontsize *= Math.max(1, Math.log10(unpackedSize) - 2);
    }

    const vs = { root: level == 0, fontsize };

    nodes.push(`"${dotEscape(module.key)}" ${vizStyle(vs)}`);

    if (!downstream) continue;
    for (const { module: dependency, type } of downstream) {
      edges.push(
        `"${dotEscape(module.key)}" -> "${dependency}" ${
          EDGE_ATTRIBUTES[type]
        }`,
      );
    }
  }

  const titleParts = entries
    .filter(([, m]) => m.level == 0)
    .map(([, m]) => dotEscape(m.module.name));

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
    `graph ${DEFAULT_STYLES.GRAPH}`,
    `node ${DEFAULT_STYLES.NODE}`,
    `edge ${DEFAULT_STYLES.EDGE}`,
    '',
  ]
    .concat(nodes)
    .concat(edges)
    .concat(
      graph.moduleInfos.size > 1
        ? `{rank=same; ${[...graph.moduleInfos.values()]
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

    const info = graphState.moduleInfos.get(fromModule.key);
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

    const info = graphState.moduleInfos.get(fromModule.key);
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
