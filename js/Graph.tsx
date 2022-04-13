import { graphviz } from '@hpcc-js/wasm';
import { select } from 'd3-selection';
import React, { useEffect, useState } from 'react';
// prettier-ignore
// @ts-ignore
import wasmUrl from "url:@hpcc-js/wasm/dist/graphvizlib.wasm";
import {
  activity,
  store,
  useColorize,
  useExcludes,
  useGraph,
  useIncludeDev,
  useInspectorOpen,
  useModule,
  usePane,
  useQuery,
} from './App';
import { GraphState, ModuleInfo } from './types';
import { $, fetchJSON, report, tagElement } from './util';
import '/css/Graph.scss';

// Promise<ArrayBuffer> contents of graphviz WASM file
const wasmBinaryPromise = fetch(wasmUrl, { credentials: 'same-origin' })
  .then(res => {
    if (!res.ok) throw Error(`Failed to load '${wasmUrl}'`);
    return res.arrayBuffer();
  })
  .then(ab => new Uint8Array(ab));

const FONT = 'Roboto Condensed, sans-serif';

const EDGE_ATTRIBUTES = {
  dependencies: '[color=black]',
  devDependencies: '[color=red]',
  peerDependencies:
    '[label=peer fontcolor="#bbbbbb" color="#bbbbbb" style=dashed]',
  // optionalDependencies: '[color=black style=dashed]',
  // optionalDevDependencies: '[color=red style=dashed]'
};

function getDependencyEntries(pkg, includeDev, level = 0) {
  const dependencyTypes = [
    'dependencies',
    'peerDependencies',
    includeDev && level <= 0 ? 'devDependencies' : null,
  ];

  pkg = pkg.package || pkg;

  const deps = [];
  for (const type of dependencyTypes) {
    if (!pkg[type]) continue;

    // Only do one level for non-"dependencies"
    if (level > 0 && type != 'dependencies') continue;

    // Get entries, adding type to each entry
    const d = Object.entries(pkg[type]);
    d.forEach(o => o.push(type));
    deps.push(...d);
  }

  return deps;
}

export function hslFor(perc) {
  return `hsl(${(Math.max(0, Math.min(1, perc)) * 120).toFixed(0)}, 100%, 75%)`;
}

/**
 * Fetch the module dependency tree for a given query
 * @param {[String]} query names of module entry points
 * @param {Boolean} includeDev flag for including devDependencies
 * @param {Function} moduleFilter applied to module dependency list(s)
 * @returns {Promise<Map>} Map of key -> {module, level, dependencies}
 */
async function modulesForQuery(query, includeDev, moduleFilter) {
  const graphState: GraphState = {
    modules: new Map(),
    referenceTypes: new Map(),
  };

  function _walk(module, level = 0) {
    if (!module) return Promise.resolve(Error('Undefined module'));

    // Array?  Apply to each element
    if (Array.isArray(module)) {
      return Promise.all(module.map(m => _walk(m, level)));
    }

    // Skip modules we've already seen
    if (graphState.modules.has(module.key)) return Promise.resolve();

    // Get dependency [name, version, dependency type] entries
    const depEntries = moduleFilter(module)
      ? getDependencyEntries(module, includeDev, level)
      : [];

    // Create object that captures info about how this module fits in the dependency graph
    const info: { module: ModuleInfo; level: number; dependencies?: object[] } =
      { module, level };
    graphState.modules.set(module.key, info);

    return Promise.all(
      depEntries.map(async ([name, version, type]) => {
        const module = await store.getModule(name, version);

        // Record the types of dependency references to this module
        if (!graphState.referenceTypes.has(module.key)) {
          graphState.referenceTypes.set(module.key, new Set());
        }
        graphState.referenceTypes.get(module.key).add(type);

        if (type !== 'peerDependencies') {
          await _walk(module, level + 1);
        }
        return { module, type };
      })
    ).then(dependencies => (info.dependencies = dependencies));
  }

  // Walk dependencies of each module in the query
  return Promise.all(
    query.map(async name => {
      const m = await store.getModule(name);
      return m && _walk(m);
    })
  ).then(() => graphState);
}

// Compose directed graph document (GraphViz notation)
function composeDOT(graph) {
  // Sort modules by [level, key]
  const entries = [...graph.entries()];
  entries.sort(([aKey, a], [bKey, b]) => {
    if (a.level != b.level) {
      a = a.level;
      b = b.level;
    } else {
      a = aKey;
      b = bKey;
    }

    return a < b ? -1 : a > b ? 1 : 0;
  });

  const nodes = ['\n// Nodes & per-node styling'];
  const edges = ['\n// Edges & per-edge styling'];

  for (const [, { module, level, dependencies }] of entries) {
    nodes.push(`"${module}"${level == 0 ? ' [root=true]' : ''}`);
    for (const { module: dependency, type } of dependencies) {
      edges.push(`"${module}" -> "${dependency}" ${EDGE_ATTRIBUTES[type]}`);
    }
  }

  const title = entries
    .filter(([, level]) => level == 0)
    .map(m => m.name)
    .join();
  return [
    'digraph {',
    'rankdir="LR"',
    'labelloc="t"',
    `label="${title}"`,
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
        : ''
    )
    .concat('}')
    .join('\n');
}

function download(type) {
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
  const vb = svg.getAttribute('viewBox').split(' ');

  const canvas = $.create<HTMLCanvasElement>('canvas');
  canvas.width = parseInt(vb[2]);
  canvas.height = parseInt(vb[3]);
  const ctx = canvas.getContext('2d');
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
    'Note: SVG downloads use the "Roboto Condensed" font, available at https://fonts.google.com/specimen/Roboto+Condensed.'
  );

  const svgData = $<SVGSVGElement>('#graph svg')[0].outerHTML;
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  generateLinkToDownload('svg', svgUrl);
}

function generateLinkToDownload(extension, link) {
  const name = $('title').innerText.replace(/.*- /, '').replace(/\W+/g, '_');
  const downloadLink = $.create<HTMLAnchorElement>('a');
  downloadLink.href = link;
  downloadLink.download = `${name}_dependencies.${extension}`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

export function selectTag(tag, selectEdges = false, scroll = false) {
  // If tag (element) is already selected, do nothing
  if (tag && tag.classList && tag.classList.contains('selected')) return;

  // Unselect nodes and edges
  $('svg .node').forEach(el => el.classList.remove('selected'));
  $('svg .edge').forEach(el => el.classList.remove('selected'));

  if (!tag) return;

  let els;

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
        const module = store.cachedEntry(el.dataset.module);
        if (title.textContent.indexOf(module?.key) >= 0) {
          const edge = $.up<SVGPathElement>(title, '.edge');
          edge?.classList.add('selected');

          // Move edge to end of child list so it's painted last
          edge.parentElement.appendChild(edge);
        }
      }
    });
  }
}

function GraphControls({ zoom, setZoom }) {
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
        className={zoom == 0 ? 'selected' : null}
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
    $(svg, 'g.node path').attr('style', null);
  } else if (colorize == 'bus') {
    for (const el of $<SVGGElement>(svg, 'g.node')) {
      const m = store.cachedEntry(el.dataset.module);
      $<SVGPathElement>(el, 'path')[0].style.fill = hslFor(
        (m?.package.maintainers.length - 1) / 3
      );
    }
  } else {
    let packageNames = $<SVGGElement>('#graph g.node').map(
      el => store.cachedEntry(el.dataset.module).name
    );

    // NPMS.io limits to 250 packages
    const reqs = [];
    const MAX_PACKAGES = 250;
    while (packageNames.length) {
      reqs.push(
        fetchJSON('https://api.npms.io/v2/package/mget', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(packageNames.slice(0, MAX_PACKAGES)),
        }).catch(err => {
          console.error(err);
          return null;
        })
      );
      packageNames = packageNames.slice(MAX_PACKAGES);
    }

    Promise.all(reqs)
      .then(arrs => arrs.filter(a => a).reduce((a, b) => ({ ...a, ...b }), {}))
      .then(res => {
        // TODO: 'Need hang module names on svg nodes with data-module attributes
        for (const el of $(svg, 'g.node')) {
          const key = $(el, 'text')[0].textContent;
          if (!key) return;

          const moduleName = key.replace(/@[\d.]+$/, '');
          let score = res[moduleName]?.score;
          switch (score && colorize) {
            case 'overall':
              score = score.final;
              break;
            case 'quality':
              score = score.detail.quality;
              break;
            case 'popularity':
              score = score.detail.popularity;
              break;
            case 'maintenance':
              score = score.detail.maintenance;
              break;
          }

          $<SVGPathElement>(el, 'path')[0].style.fill = score
            ? hslFor(score)
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

export default function Graph() {
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

  async function handleGraphClick(event) {
    if ($('#graph-controls').contains(event.target)) return;

    const el = $.up(event.target, '.node');

    const key = $(el, 'title')?.textContent?.trim();
    const module = key && store.cachedEntry(key);

    if (event.shiftKey) {
      if (module) {
        const isIncluded = excludes.includes(module.name);
        if (isIncluded) {
          setExcludes(excludes.filter(n => n !== module.name));
        } else {
          setExcludes([...excludes, module.name]);
        }
      }

      return;
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
      zoom === 0 && w < graphEl.clientWidth && h < graphEl.clientHeight
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

    select('#graph svg .node').node()?.scrollIntoView();
  }

  // Filter for which modules should be shown / collapsed in the graph
  function moduleFilter({ name }) {
    return !excludes?.includes(name);
  }

  // NOTE: Graph rendering can take a significant amount of time.  It is also dependent on UI settings.
  // Thus, it's broken up into different useEffect() actions, below.

  // Effect: Fetch modules
  useEffect(() => {
    const { signal, abort } = createAbortable();
    setGraph(null);
    setModule([]);

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
      // Compose SVG markup
      const wasmBinary = await wasmBinaryPromise; // Avoid race if wasmBinary fetch hasn't completed
      if (signal.aborted) return; // Check after all async stuff

      const svgMarkup = graph?.modules.size
        ? await graphviz.layout(composeDOT(graph.modules), 'svg', 'dot', {
            wasmBinary,
          })
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

        const m = store.cachedEntry(key);

        const refTypes = graph?.referenceTypes.get(key);

        // Style peer dependencies
        if (refTypes?.has('peerDependencies') && refTypes.size === 1) {
          el.classList.add('peer');
        }

        if (m?.package?.deprecated) {
          el.classList.add('warning');
        }

        if (m?.name) {
          tagElement(el, 'module', m.name);
          el.dataset.module = m.key;
        } else {
          report.warn(Error(`Bad replace: ${key}`));
        }

        if (!moduleFilter(m)) {
          el.classList.add('collapsed');
        }

        const pkg = m.package;
        if (pkg.stub) {
          el.classList.add('stub');
        } else {
          tagElement(el, 'maintainer', ...pkg.maintainers.map(m => m.name));
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

  $('title').innerText = `NPMGraph - ${query.join(', ')}`;

  return (
    <div id="graph" onClick={handleGraphClick}>
      <GraphControls zoom={zoom} setZoom={setZoom} />
    </div>
  );
}
