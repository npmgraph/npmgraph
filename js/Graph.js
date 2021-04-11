import React, { useState, useEffect, useContext } from 'react';

import * as d3 from 'd3';
// import { graphviz } from '@hpcc-js/wasm';
import 'd3-graphviz';

import { AppContext, store, activity } from './App.js';
import { $, tagElement, report, fetchJSON } from './util.js';

const FONT = 'Roboto Condensed, sans-serif';

const EDGE_ATTRIBUTES = {
  dependencies: '[color=black]',
  devDependencies: '[color=red]',
  peerDependencies: '[color=green]'
  // optionalDependencies: '[color=black style=dashed]',
  // optionalDevDependencies: '[color=red style=dashed]'
};

function getDependencyEntries(pkg, depIncludes, level = 0) {
  pkg = pkg.package || pkg;

  const deps = [];

  for (const type of depIncludes) {
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
 * @param {[String]} depIncludes dependencies to include
 * @returns {Promise<Map>} Map of key -> {module, level, dependencies}
 */
async function modulesForQuery(query, depIncludes) {
  const graph = new Map();

  function _walk(module, level = 0) {
    if (!module) return Promise.resolve(Error('Undefined module'));

    // Array?  Apply to each element
    if (Array.isArray(module)) {
      return Promise.all(module.map(m => _walk(m, level)));
    }

    // Skip modules we've already seen
    if (module && graph.has(module.key)) return Promise.resolve();

    // Get dependency [name, version, dependency type] entries
    const depEntries = getDependencyEntries(module, depIncludes, level);

    // Create object that captures info about how this module fits in the dependency graph
    const info = { module, level };
    graph.set(module.key, info);

    return Promise.all(
      depEntries.map(async([name, version, type]) => {
        const module = await store.getModule(name, version);
        await _walk(module, level + 1);
        return { module, type };
      })
    )
      .then(dependencies => info.dependencies = dependencies);
  }

  // Walk dependencies of each module in the query
  return Promise.all(query.map(async(name) => {
    const m = await store.getModule(name);
    return m && _walk(m);
  }))
    .then(() => graph);
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

  const title = entries.filter(([, level]) => level == 0).map(m => m.name).join();
  return [
    'digraph {',
    'rankdir="LR"',
    'labelloc="t"',
    `label="${title}"`,
    '// Default styles',
    `graph [fontsize=16 fontname="${FONT}"]`,
    `node [shape=box style=rounded fontname="${FONT}" fontsize=11 height=0 width=0 margin=.04]`,
    `edge [fontsize=10, fontname="${FONT}" splines="polyline"]`,
    ''
  ]
    .concat(nodes)
    .concat(edges)
    .concat(
      graph.size > 1 ? `{rank=same; ${
          [...graph.values()].filter(info => info.level == 0).map(info => `"${info.module}"`).join('; ')
        };}` : ''
    )
    .concat('}')
    .join('\n');
}

function zoom(op) {
  const svg = $('#graph svg')[0];
  if (!svg) return;

  const vb = svg.getAttribute('viewBox').split(' ');

  switch (op) {
    case 0:
      svg.setAttribute('width', vb[2]);
      svg.setAttribute('height', vb[3]);
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
  const svg = $('#graph svg')[0];
  const data = svg.outerHTML;
  const vb = svg.getAttribute('viewBox').split(' ');

  const canvas = $.create('canvas');
  canvas.width = vb[2];
  canvas.height = vb[3];
  const ctx = canvas.getContext('2d');
  const DOMURL = window.URL || window.webkitURL || window;
  const img = new Image();
  const svgBlob = new Blob([data], { type: 'image/svg+xml' });
  const url = DOMURL.createObjectURL(svgBlob);
  img.onload = function() {
    ctx.drawImage(img, 0, 0);
    DOMURL.revokeObjectURL(url);
    const pngImg = canvas.toDataURL('image/png');
    generateLinkToDownload('png', pngImg);
  };
  img.src = url;
}

function downloadSvg() {
  alert('Note: SVG downloads use the "Roboto Condensed" font, available at https://fonts.google.com/specimen/Roboto+Condensed.');

  const svgData = $('#graph svg')[0].outerHTML;
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  generateLinkToDownload('svg', svgUrl);
}

function generateLinkToDownload(extension, link) {
  const name = $('title').innerText.replace(/.*- /, '').replace(/\W+/g, '_');
  const downloadLink = $.create('a');
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

  if (typeof (tag) == 'string') {
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
          const edge = $.up(title, '.edge');
          edge?.classList.add('selected');

          // Move edge to end of child list so it's painted last
          edge.parentElement.appendChild(edge.remove() || edge);
        }
      }
    });
  }
}

export function GraphControls() {
  return <div id='graph-controls'>
    <button onClick={() => zoom(1)} title='zoom (fit width)' className='material-icons' style={{ borderRadius: '3px 0 0 3px' }}>swap_horiz</button>
    <button onClick={() => zoom(0)} title='zoom (1:1)' style={{ fontSize: '1em', padding: '0 .5em', width: 'fit-content', borderWidth: '1px 0px', borderRadius: 0 }}>1:1</button>
    <button onClick={() => zoom(2)} title='zoom (fit height)' className='material-icons' style={{ borderRadius: '0 3px 3px 0' }}>swap_vert</button>
    <button onClick={() => download('svg')} title='download as SVG' className='material-icons' style={{ marginLeft: '0.5em' }}>cloud_download</button>
  </div>;
}

export default function Graph(props) {
  const {
    query: [query],
    colorize: [colorize],
    depIncludes: [depIncludes],
    pane: [, setPane],
    inspectorOpen: [, setInspectorOpen],
    module: [, setModule],
    graph: [, setGraph]
  } = useContext(AppContext);

  const [svg, setSvg] = useState();

  async function handleGraphClick(event) {
    if ($('#graph-controls').contains(event.srcElement)) return;

    const el = $.up(event.srcElement, '.node');

    selectTag(el, true);

    const key = $(el, 'title')?.textContent?.trim();
    const module = key && store.cachedEntry(key);

    if (el) setInspectorOpen(true);
    setModule(module);
    setPane(module ? 'module' : 'graph');
  }

  // Effect: Render graph
  useEffect(async() => {
    let cancelled = false;

    setGraph([]);
    setModule([]);

    const graph = await modulesForQuery(query, depIncludes);

    const onFinish = activity.start('Rendering');

    composeDOT(graph);
    // TODO: Render using hpcc/wasm directly per https://raw.githack.com/hpcc-systems/hpcc-js-wasm/trunk/index.html
    // const graphviz = d3.select('#graph')
    //   .graphviz({ zoom: false, useWorker: false })
    //   .renderDot(composeDOT(graph));

    // HACK: Until I get the above issue figured out...
    const graphviz = { on: () => {} };

    // Post-process rendered DOM
    graphviz?.on('end', async() => {
      if (cancelled) return;

      const PATTERN = `<pattern id="warning"
        width="12" height="12"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45 50 50)">
        <line stroke="rgba(192,192,0,.15)" stroke-width="6px" x1="3" x2="3" y2="12"/>
        <line stroke="rgba(0,0,0,.15)" stroke-width="6px" x1="9" x2="9" y2="12"/>
      </pattern>`;

      d3.select('#graph svg')
        .insert('defs', ':first-child')
        .html(PATTERN);

      for (const el of $('#graph g.node')) {
        // Find module this node represents
        const key = $(el, 'text')[0].textContent;
        if (!key) continue;

        const m = store.cachedEntry(key);

        if (m?.package?.deprecated) {
          el.classList.add('warning');
        }

        if (m?.name) {
          tagElement(el, 'module', m.name);
          el.dataset.module = m.key;
        } else {
          report.warn(Error(`Bad replace: ${key}`));
        }

        const pkg = m.package;
        if (pkg.stub) {
          el.classList.add('stub');
        } else {
          tagElement(el, 'maintainer', ...pkg.maintainers.map(m => m.name));
          tagElement(el, 'license', m.licenseString);
        }
      }

      setSvg($('#graph svg')[0]);

      d3.select('#graph svg .node').node()?.scrollIntoView();

      onFinish();
    });

    setGraph(graph);
    setPane(graph.size ? 'graph' : 'info');

    return () => cancelled = true;
  }, [query, depIncludes]);

  // Effect: Colorize nodes
  useEffect(async() => {
    let cancelled = false;
    if (!colorize) {
      $(svg, 'g.node path').attr('style', null);
    } else if (colorize == 'bus') {
      for (const el of $(svg, 'g.node')) {
        const m = store.cachedEntry(el.dataset.module);
        $(el, 'path')[0].style.fill = hslFor((m?.package.maintainers.length - 1) / 3);
      }
    } else {
      let packageNames = $('#graph g.node').map(el => store.cachedEntry(el.dataset.module).name);

      // NPMS.io limits to 250 packages
      const reqs = [];
      const MAX_PACKAGES = 250;
      while (packageNames.length) {
        reqs.push(
          fetchJSON('https://api.npms.io/v2/package/mget', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(packageNames.slice(0, MAX_PACKAGES))
          })
            .catch(err => {
              console.error(err);
              return null;
            })
        );
        packageNames = packageNames.slice(MAX_PACKAGES);
      }

      Promise.all(reqs)
        .then(arrs => arrs.filter(a => a).reduce((a, b) => ({ ...a, ...b }), {}))
        .then(res => {
          if (cancelled) return;
          // TODO: 'Need hang module names on svg nodes with data-module attributes
          for (const el of $(svg, 'g.node')) {
            const key = $(el, 'text')[0].textContent;
            if (!key) return;

            const moduleName = key.replace(/@[\d.]+$/, '');
            let score = res[moduleName]?.score;
            switch (score && colorize) {
              case 'overall': score = score.final; break;
              case 'quality': score = score.detail.quality; break;
              case 'popularity': score = score.detail.popularity; break;
              case 'maintenance': score = score.detail.maintenance; break;
            }

            $(el, 'path')[0].style.fill = score ? hslFor(score) : '';
          }
        });
    }

    return () => cancelled = true;
  });

  $('title').innerText = `NPMGraph - ${query.join(', ')}`;

  return <div id='graph' onClick={handleGraphClick} >
    <GraphControls />
  </div>;
}
