import { Graphviz } from '@hpcc-js/wasm/graphviz';
import { select } from 'd3-selection';
import React, { useEffect, useState } from 'react';
import {
  useColorize,
  useExcludes,
  useGraph,
  useIncludeDev,
  useInspectorOpen,
  useModule,
  usePane,
  useQuery,
} from './App.js';
import Module from './Module.js';
import { NPMSIOData } from './fetch_types.js';
import {
  DependencyKey,
  GraphModuleInfo,
  GraphState,
  ModulePackage,
} from './types.js';
import LoadActivity from './util/LoadActivity.js';
import { getCachedModule, getModule } from './util/ModuleRegistry.js';
import { report } from './util/bugsnag.js';
import $, { tagElement } from './util/dom.js';
import fetchJSON from './util/fetchJSON.js';
import simplur from './util/simplur.js';
import '/css/Graph.scss';

const graphvizP = Graphviz.load();

const FONT = 'Roboto Condensed, sans-serif';

const EDGE_ATTRIBUTES = {
  dependencies: '[color=black]',
  devDependencies: '[color=red]',
  peerDependencies:
    '[label=peer fontcolor="#bbbbbb" color="#bbbbbb" style=dashed]',
  optionalDependencies: '[color=black style=dashed]', // unused
  optionalDevDependencies: '[color=red style=dashed]', // unused
};

export const COLORIZE_MODULE_ESM = '#ffff66';
export const COLORIZE_MODULE_CJS = '#ffaa66';

function isModule(m: Module | ModulePackage): m is Module {
  return 'package' in m;
}

type DependencyEntry = { name: string; version: string; type: DependencyKey };

function getDependencyEntries(
  pkg: Module | ModulePackage,
  includeDev: boolean,
  level = 0,
) {
  const dependencyTypes: DependencyKey[] = ['dependencies', 'peerDependencies'];
  if (includeDev && level <= 0) {
    dependencyTypes.push('devDependencies');
  }

  const packageData = isModule(pkg) ? pkg.package : pkg;

  const depEntries: Array<DependencyEntry> = [];
  for (const type of dependencyTypes) {
    const deps = packageData[type];
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

export function hslFor(perc: number) {
  return `hsl(${(Math.max(0, Math.min(1, perc)) * 120).toFixed(0)}, 100%, 75%)`;
}

/**
 * Fetch the module dependency tree for a given query
 * @param {[String]} query names of module entry points
 * @param {Boolean} includeDev flag for including devDependencies
 * @param {Function} moduleFilter applied to module dependency list(s)
 * @returns {Promise<Map>} Map of key -> {module, level, dependencies}
 */
async function modulesForQuery(
  query: string[],
  includeDev: boolean,
  moduleFilter: (m: Module | ModulePackage) => boolean,
) {
  const graphState: GraphState = {
    modules: new Map(),
    referenceTypes: new Map(),
  };

  function _walk(module: Module[] | Module, level = 0): Promise<unknown> {
    if (!module) return Promise.resolve(Error('Undefined module'));

    // Array?  Apply to each element
    if (Array.isArray(module)) {
      return Promise.all(module.map(m => _walk(m, level)));
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

    return Promise.all(
      deps.map(async ({ name, version, type }) => {
        const module = await getModule(name, version);

        // Record the types of dependency references to this module
        let refTypes = graphState.referenceTypes.get(module.key);
        if (!refTypes) {
          graphState.referenceTypes.set(module.key, (refTypes = new Set()));
        }
        refTypes.add(type);

        if (type !== 'peerDependencies') {
          await _walk(module, level + 1);
        }
        return { module, type };
      }),
    ).then(dependencies => (info.dependencies = dependencies));
  }

  // Walk dependencies of each module in the query
  return Promise.all(
    query.map(async name => {
      const m = await getModule(name);
      return m && _walk(m);
    }),
  ).then(() => graphState);
}

// Compose directed graph document (GraphViz notation)
function composeDOT(graph: Map<string, GraphModuleInfo>) {
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

type DownloadExtension = 'svg' | 'png';
function download(type: DownloadExtension) {
  switch (type) {
    case 'svg':
      downloadSvg();
      break;
    case 'png':
      downloadPng();
      break;
  }
}

function downloadPng() {
  const svg = $<SVGSVGElement>('#graph svg')[0];
  const data = svg.outerHTML;
  const vb = svg.getAttribute('viewBox')?.split(' ');

  if (!vb) {
    report.error(Error('No viewBox'));
    return;
  }

  const canvas = $.create<HTMLCanvasElement>('canvas');
  canvas.width = parseInt(vb[2]);
  canvas.height = parseInt(vb[3]);
  const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
  const DOMURL = window.URL || window.webkitURL;
  const img = new Image();
  const svgBlob = new Blob([data], { type: 'image/svg+xml' });
  const url = DOMURL.createObjectURL(svgBlob);

  img.onload = function () {
    ctx.drawImage(img, 0, 0);
    DOMURL.revokeObjectURL(url);
    const pngImg = canvas.toDataURL('image/png');
    generateLinkToDownload('png', pngImg);
  };
  img.src = url;
}

function downloadSvg() {
  alert(
    'Note: SVG downloads use the "Roboto Condensed" font, available at https://fonts.google.com/specimen/Roboto+Condensed.',
  );

  const svgData = $<SVGSVGElement>('#graph svg')[0].outerHTML;
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  generateLinkToDownload('svg', svgUrl);
}

function generateLinkToDownload(extension: DownloadExtension, link: string) {
  const name = $('title').innerText.replace(/.*- /, '').replace(/\W+/g, '_');
  const downloadLink = $.create<HTMLAnchorElement>('a');
  downloadLink.href = link;
  downloadLink.download = `${name}_dependencies.${extension}`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

export function selectTag(
  tag: string | HTMLElement | SVGElement | undefined,
  selectEdges = false,
  scroll = false,
) {
  // If tag (element) is already selected, do nothing
  if (
    tag instanceof HTMLElement &&
    tag.classList &&
    tag.classList.contains('selected')
  ) {
    return;
  }

  // Unselect nodes and edges
  $('svg .node').forEach(el => el.classList.remove('selected'));
  $('svg .edge').forEach(el => el.classList.remove('selected'));

  if (!tag) return;

  let els: (HTMLElement | SVGElement)[];

  if (typeof tag == 'string') {
    els = $(`svg .node.${tag}`);
  } else {
    els = [tag];
  }

  // Select nodes
  els.forEach((el, i) => {
    el.classList.add('selected');
    if (i == 0 && scroll) el.scrollIntoView();
  });

  // Select edges
  if (selectEdges) {
    $('.edge title').forEach(title => {
      for (const el of els) {
        const module = getCachedModule(el.dataset.module ?? '');
        if (!module) continue;

        if ((title.textContent ?? '').indexOf(module.key) >= 0) {
          const edge = $.up<SVGPathElement>(title, '.edge');
          if (!edge) continue;

          edge.classList.add('selected');

          // Move edge to end of child list so it's painted last
          edge.parentElement?.appendChild(edge);
        }
      }
    });
  }
}

function GraphControls({
  zoom,
  setZoom,
}: {
  zoom: number;
  setZoom: (zoom: number) => void;
}) {
  return (
    <div id="graph-controls">
      <button
        className={`material-icons ${zoom == 1 ? 'selected' : ''}`}
        onClick={() => setZoom(1)}
        title="zoom (fit width)"
        style={{ borderRadius: '3px 0 0 3px' }}
      >
        swap_horiz
      </button>
      <button
        className={zoom == 0 ? 'selected' : ''}
        onClick={() => setZoom(0)}
        title="zoom (1:1)"
        style={{
          fontSize: '1em',
          padding: '0 .5em',
          width: 'fit-content',
          borderWidth: '1px 0px',
          borderRadius: 0,
        }}
      >
        1:1
      </button>
      <button
        className={`material-icons ${zoom == 2 ? 'selected' : ''}`}
        onClick={() => setZoom(2)}
        title="zoom (fit height)"
        style={{ borderRadius: '0 3px 3px 0' }}
      >
        swap_vert
      </button>
      <button
        onClick={() => download('svg')}
        title="download as SVG"
        className="material-icons"
        style={{ marginLeft: '0.5em' }}
      >
        cloud_download
      </button>
    </div>
  );
}

function colorizeGraph(svg: SVGSVGElement, colorize: string) {
  if (!colorize) {
    $(svg, 'g.node path').attr('style', undefined);
  } else if (colorize == 'bus') {
    for (const el of $<SVGGElement>(svg, 'g.node')) {
      const m = getCachedModule(el.dataset.module ?? '');
      $<SVGPathElement>(el, 'path')[0].style.fill = hslFor(
        ((m?.package.maintainers?.length ?? 1) - 1) / 3,
      );
    }
  } else if (colorize == 'moduleType') {
    for (const el of $<SVGGElement>('#graph g.node')) {
      const moduleName = el.dataset.module;
      if (!moduleName) continue;

      const module = getCachedModule(el.dataset.module ?? '');
      const elPath = $<SVGPathElement>(el, 'path')[0];
      if (module) {
        const url = `https://cdn.jsdelivr.net/npm/${module.key}/package.json`;
        fetchJSON<{ type: string }>(url)
          .then(pkg => {
            elPath.style.fill =
              pkg.type === 'module' ? COLORIZE_MODULE_ESM : COLORIZE_MODULE_CJS;
          })
          .catch(() => (elPath.style.fill = ''));
      } else {
        elPath.style.fill = '';
      }
    }
  } else {
    let packageNames = $<SVGGElement>('#graph g.node')
      .map(el => getCachedModule(el.dataset.module ?? '')?.name)
      .filter(Boolean);

    // npms.io limits to 250 packages, so query in batches
    const reqs: Promise<Record<string, NPMSIOData> | null>[] = [];
    const MAX_PACKAGES = 250;
    while (packageNames.length) {
      reqs.push(
        fetchJSON<Record<string, NPMSIOData>>(
          'https://api.npms.io/v2/package/mget',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(packageNames.slice(0, MAX_PACKAGES)),
          },
        ).catch(err => {
          console.error(err);
          return null;
        }),
      );
      packageNames = packageNames.slice(MAX_PACKAGES);
    }

    Promise.all(reqs)
      .then(infos => {
        // Merge results back into a single object
        const infoAccum: { [key: string]: NPMSIOData } = {};
        for (const info of infos) {
          if (!info) continue;
          Object.assign(infoAccum, info);
        }

        return infoAccum;
      })
      .then(res => {
        // TODO: 'Need hang module names on svg nodes with data-module attributes
        for (const el of $(svg, 'g.node')) {
          const key = $(el, 'text')[0].textContent;
          if (!key) return;

          const moduleName = key.replace(/@[\d.]+$/, '');
          const score = res[moduleName]?.score;
          let fill: number | undefined;
          switch (score && colorize) {
            case 'overall':
              fill = score.final;
              break;
            case 'quality':
              fill = score.detail.quality;
              break;
            case 'popularity':
              fill = score.detail.popularity;
              break;
            case 'maintenance':
              fill = score.detail.maintenance;
              break;
          }

          $<SVGPathElement>(el, 'path')[0].style.fill = fill
            ? hslFor(fill)
            : '';
        }
      });
  }
}

// :facepalm: https://github.com/whatwg/dom/issues/981
function createAbortable() {
  const signal = { aborted: false };

  return {
    signal,
    abort: () => {
      signal.aborted = true;
    },
  };
}

export default function Graph({ activity }: { activity: LoadActivity }) {
  const [query] = useQuery();
  const [includeDev] = useIncludeDev();
  const [, setPane] = usePane();
  const [, setInspectorOpen] = useInspectorOpen();
  const [, setModule] = useModule();
  const [graph, setGraph] = useGraph();
  const [excludes, setExcludes] = useExcludes();
  const [colorize] = useColorize();
  const [zoom, setZoom] = useState(0);

  // Signal for when Graph DOM changes
  const [domSignal, setDomSignal] = useState(0);

  async function handleGraphClick(event: React.MouseEvent) {
    const target = event.target as HTMLDivElement;

    if ($('#graph-controls').contains(target)) return;

    const el = $.up<SVGElement>(target, '.node');

    let module: Module | undefined;
    if (el) {
      const key = $(el, 'title')?.textContent?.trim();
      module = getCachedModule(key);
      if (event.shiftKey) {
        if (module) {
          const isIncluded = excludes.includes(module.name);
          if (isIncluded) {
            // Why is `module?.` needed here, but not above or below???
            setExcludes(excludes.filter(n => n !== module?.name));
          } else {
            setExcludes([...excludes, module.name]);
          }
        }

        return;
      }
    }

    selectTag(el, true);

    if (el) setInspectorOpen(true);

    setModule(module);
    setPane(module ? 'module' : 'graph');
  }

  function applyZoom() {
    const graphEl = $<HTMLDivElement>('#graph')[0];
    const svg = $<SVGSVGElement>('#graph svg')[0];
    if (!svg) return;

    // Note: Not using svg.getBBox() here because (for some reason???) it's
    // smaller than the actual bounding box
    const vb = svg.getAttribute('viewBox')?.split(' ').map(Number);
    if (!vb) return;

    const [, , w, h] = vb;
    graphEl.classList.toggle(
      'centered',
      zoom === 0 && w < graphEl.clientWidth && h < graphEl.clientHeight,
    );

    switch (zoom) {
      case 0:
        svg.setAttribute('width', String(w));
        svg.setAttribute('height', String(h));
        break;

      case 1:
        svg.setAttribute('width', '100%');
        svg.removeAttribute('height');
        break;

      case 2:
        svg.removeAttribute('width');
        svg.setAttribute('height', '100%');
        break;
    }

    (select('#graph svg .node').node() as HTMLElement)?.scrollIntoView();
  }

  // Filter for which modules should be shown / collapsed in the graph
  function moduleFilter({ name }: { name: string }) {
    return !excludes?.includes(name);
  }

  // NOTE: Graph rendering can take a significant amount of time.  It is also dependent on UI settings.
  // Thus, it's broken up into different useEffect() actions, below.

  // Effect: Fetch modules
  useEffect(() => {
    const { signal, abort } = createAbortable();
    setGraph(null);
    setModule(undefined);

    modulesForQuery(query, includeDev, moduleFilter).then(newGraph => {
      if (signal.aborted) return; // Check after async

      setGraph(newGraph);
    });

    return abort;
  }, [query, includeDev, excludes]);

  // Effect: Parse SVG markup into DOM
  useEffect(() => {
    const { signal, abort } = createAbortable();

    // Post-process rendered DOM
    const finish = activity.start('Rendering');

    // Render SVG markup (async)
    (async function () {
      const graphviz = await graphvizP;
      if (signal.aborted) return; // Check after all async stuff

      // Compose SVG markup
      const svgMarkup = graph?.modules.size
        ? await graphviz.dot(composeDOT(graph.modules), 'svg')
        : '<svg />';
      if (signal.aborted) return; // Check after all async stuff

      // Parse markup
      const svgDom = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml')
        .children[0] as SVGSVGElement;
      svgDom.remove();

      // Remove background element so page background shows thru
      $(svgDom, '.graph > polygon').remove();
      svgDom.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      // Inject into DOM
      const el = $('#graph');
      select('#graph svg').remove();
      el.appendChild(svgDom);

      // Inject bg pattern for deprecated modules
      const PATTERN = `<pattern id="warning"
        width="12" height="12"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45 50 50)">
        <line class="line0" stroke-width="6px" x1="3" x2="3" y2="12"/>
        <line class="line1" stroke-width="6px" x1="9" x2="9" y2="12"/>
        </pattern>`;

      select('#graph svg').insert('defs', ':first-child').html(PATTERN);

      // Decorate DOM nodes with appropriate classname
      for (const el of $<SVGPathElement>('#graph g.node')) {
        // Find module this node represents
        const key = $(el, 'text')[0].textContent;
        if (!key) continue;

        const m = getCachedModule(key);

        const refTypes = graph?.referenceTypes.get(key);

        // Style peer dependencies
        if (refTypes?.has('peerDependencies') && refTypes.size === 1) {
          el.classList.add('peer');
        }

        if (!m) continue;

        if (m?.package.deprecated) {
          el.classList.add('warning');
        }

        if (m.name) {
          tagElement(el, 'module', m.name);
          el.dataset.module = m.key;
        } else {
          report.warn(Error(`Bad replace: ${key}`));
        }

        if (!moduleFilter(m)) {
          el.classList.add('collapsed');
        }

        const pkg = m.package;
        if (pkg._stub) {
          el.classList.add('stub');
        } else {
          tagElement(el, 'maintainer', ...m.maintainers.map(m => m.name));

          tagElement(el, 'license', m.licenseString);
        }
      }

      setPane(graph?.modules.size ? 'graph' : 'info');

      // Signal other hooks that graph DOM has changed
      setDomSignal(domSignal + 1);

      finish?.();
    })();

    return () => {
      finish();
      abort();
    };
  }, [graph]);

  // Effect: Colorize nodes
  useEffect(() => {
    colorizeGraph($<SVGSVGElement>('#graph svg')[0], colorize);
  }, [colorize, domSignal]);

  // (Re)apply zoom if/when it changes
  useEffect(applyZoom, [zoom, domSignal]);

  $('title').innerText = `npmgraph - ${query.join(', ')}`;

  return (
    <div id="graph" onClick={handleGraphClick}>
      <GraphControls zoom={zoom} setZoom={setZoom} />
    </div>
  );
}
