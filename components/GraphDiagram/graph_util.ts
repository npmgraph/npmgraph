import { satisfies } from 'semver';
import { $ } from 'select-dom';
import simplur from 'simplur';
import type Module from '../../lib/Module.ts';
import { getModule } from '../../lib/ModuleCache.ts';
import { PARAM_QUERY, UNNAMED_PACKAGE } from '../../lib/constants.ts';
import { getModuleKey } from '../../lib/module_util.ts';

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
  peerDependencies: '[color=black style=dashed]',
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
    if (level > 0 && type !== 'dependencies') continue;

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
    failedEntryModules: new Map(),
  };

  async function _visit(
    module: Module[] | Module,
    level = 0,
  ): Promise<GraphModuleInfo | void> {
    if (!module) return Promise.reject(new Error('Undefined module'));

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
      if (m.isStub) {
        graphState.failedEntryModules.set(
          moduleKey,
          m.stubError ?? new Error(`Failed to load ${moduleKey}`),
        );
      } else {
        graphState.entryModules.add(m);
        return _visit(m);
      }
    }),
  );

  // Second pass: add peer dependency edges for modules already in the graph
  // Build a name-indexed map for O(1) lookups
  const modulesByName = new Map<string, Module[]>();
  for (const [, { module }] of graphState.moduleInfos) {
    let list = modulesByName.get(module.name);
    if (!list) {
      list = [];
      modulesByName.set(module.name, list);
    }
    list.push(module);
  }

  for (const [, info] of graphState.moduleInfos) {
    const { peerDependencies } = info.module.package;
    if (!peerDependencies) continue;

    for (const [name, versionRange] of Object.entries(peerDependencies)) {
      const candidates = modulesByName.get(name);
      if (!candidates) continue;

      for (const peerModule of candidates) {
        if (!peerModule.version) continue;
        try {
          if (!satisfies(peerModule.version, versionRange)) continue;
        } catch {
          continue;
        }

        info.downstream.add({ module: peerModule, type: 'peerDependencies' });
        graphState.moduleInfos
          .get(peerModule.key)
          ?.upstream.add({ module: info.module, type: 'peerDependencies' });
      }
    }
  }

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
  const pairs = Object.entries(obj).map(([key, value]) => {
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
    if (a.level !== b.level) {
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

    const link = new URL(location.origin);
    link.searchParams.append(PARAM_QUERY, module.key);
    const label = module.isUnnamed ? UNNAMED_PACKAGE : undefined;
    const vs = { root: level === 0, fontsize, href: link.href, label };

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
    .filter(([, m]) => m.level === 0)
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
    // Uncomment to include title (which we don't per #289)
    // `label="${titleParts.join(', ')}"`,
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
            .filter(info => info.level === 0)
            .map(info => `"${info.module}"`)
            .join('; ')};}`
        : '',
    )
    .concat('}')
    .join('\n');
}

export function foreachUpstream(
  module: Module,
  graph: GraphState,
  callback: (module: Module) => void,
  seen: Set<Module> = new Set(),
) {
  const info = graph.moduleInfos.get(module.key);
  if (!info || seen.has(module)) return;
  seen.add(module);

  for (const { module } of info.upstream) {
    callback(module);
    foreachUpstream(module, graph, callback, seen);
  }
}

export function foreachDownstream(
  module: Module,
  graph: GraphState,
  callback: (module: Module) => void,
  seen: Set<Module> = new Set(),
) {
  const info = graph.moduleInfos.get(module.key);
  if (!info || seen.has(module)) return;
  seen.add(module);

  for (const { module } of info.downstream) {
    callback(module);
    foreachDownstream(module, graph, callback, seen);
  }
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

export function getDiagramElement() {
  return $<SVGSVGElement>('#graph svg#graph-diagram');
}
