import { d3, Viz } from '/vendor/shims.js';
import { html, useState, useEffect, useContext } from '/vendor/preact.js';
import { AppContext } from './App.js';
import { $, tagElement, entryFromKey, report, getDependencyEntries, ajax } from './util.js';

import Store from './Store.js';

const FONT = 'Roboto Condensed, sans-serif';

const EDGE_ATTRIBUTES = {
  dependencies: '[color=black]',
  devDependencies: '[color=red]',
  peerDependencies: '[color=green]'
  // optionalDependencies: '[color=black style=dashed]',
  // optionalDevDependencies: '[color=red style=dashed]'
};

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
        const module = await Store.getModule(name, version);
        await _walk(module, level + 1);
        return { module, type };
      })
    )
      .then(dependencies => info.dependencies = dependencies);
  }

  // Walk dependencies of each module in the query
  return Promise.all(query.map(async(name) => {
    const m = await Store.getModule(name);
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
      const t = title.textContent;
      for (const el of els) {
        const key = el.dataset.moduleKey;
        if (title.textContent.indexOf(key) >= 0) {
          const edge = $.up(title, '.edge');
          edge?.classList.add('selected');

          // Move edge to end of child list so it's painted last
          edge.parentElement.appendChild(edge.remove() || edge);
        }
      }
    });
  }
}

function Loader({ complete, total, ...props }) {
  const perc = complete / total * 100;
  return html`
    <div className="loader" ...${props}>
      <div className="inner" style=${{ width: `${perc}%` }} />
    </div>
  `;
}

export function GraphControls() {
  return html`
    <div id="graph-controls" >
      <button onClick=${() => zoom(1)} title="zoom (fit width)" class="material-icons" style="border-radius: 3px 0 0 3px">swap_horiz</button>
      <button onClick=${() => zoom(0)} title="zoom (1:1)" style="font-size: 1em; padding: 0 .5em; width: fit-content; border-width: 1px 0px; border-radius: 0">1:1</button>
      <button onClick=${() => zoom(2)} title="zoom (fit height)" class="material-icons" style="border-radius: 0 3px 3px 0">swap_vert</button>
      <button onClick=${() => download('svg')} title="download as SVG" class="material-icons" style="margin-left: 0.5em">cloud_download</button>
    </div>
  `;
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

  const [loadStats, setLoadStats] = useState(null);
  const [svg, setSvg] = useState();

  async function handleGraphClick(event) {
    if ($('#graph-controls').contains(event.srcElement)) return;

    const el = $.up(event.srcElement, '.node');

    selectTag(el, true);

    const moduleName = $(el, 'title')?.textContent?.trim();
    const module = moduleName && await Store.getModule(...entryFromKey(moduleName));

    if (el) setInspectorOpen(true);
    setModule(module);
    setPane(module ? 'module' : 'graph');
  }

  // Effect: Render graph
  useEffect(async() => {
    let cancelled = false;

    setGraph([]);
    setModule([]);

    Store.onRequest = stats => {
      if (cancelled) return;
      setLoadStats({ ...stats });
    };

    const graph = await modulesForQuery(query, depIncludes);

    const graphviz = d3.select('#graph')
      .graphviz({ zoom: false })
      .renderDot(composeDOT(graph));

    graphviz.on('end', async() => {
      if (cancelled) return;

      await Promise.all(
        $('#graph g.node').map(async el => {
          // Find module this node represents
          const key = $(el, 'text')[0].textContent;
          if (!key) return;
          const m = await Store.getModule(...entryFromKey(key));

          if (m.name) {
            tagElement(el, 'module', m.name);
            el.dataset.moduleKey = m.key;
            el.dataset.moduleName = m.name;
            el.dataset.moduleVersion = m.version;
          } else {
            report.warn(Error(`Bad replace: ${key}`));
          }

          const pkg = m.package;
          if (pkg.maintainers.length < 2) {
            // Tag modules that are at risk of being orphaned if something happens to
            // the maintainer (e.g. gets run over by a bus)
            el.classList.add('tag-bus');
          }

          if (pkg.stub) {
            el.classList.add('stub');
          } else {
            tagElement(el, 'maintainer', ...pkg.maintainers.map(m => m.name));
            tagElement(el, 'license', m.licenseString);
          }
        })
      );

      setSvg($('#graph svg')[0]);
    });

    d3.select('#graph svg .node').node()?.scrollIntoView();

    setGraph(graph);
    setPane(graph.size ? 'graph' : 'info');

    return () => cancelled = true;
  }, [query, depIncludes]);

  // Effect: Colorize nodes
  useEffect(async() => {
    let cancelled = false;
    if (!colorize) {
      $(svg, 'g.node path').attr('style', null);
    } else {
      const packageNames = $('#graph g.node').map(el => el.dataset.moduleName);
      ajax('POST', 'https://api.npms.io/v2/package/mget', packageNames)
        .then(res => {
          if (cancelled) return;

          // TODO: 'Need hang module names on svg nodes with data-module attributes
          for (const el of $(svg, 'g.node')) {
            const key = $(el, 'text')[0].textContent;
            if (!key) return;

            const moduleName = key.replace(/@[\d.]+$/, '');
            const score = res[moduleName]?.score?.final;

            $(el, 'path')[0].style.fill =
              score ? `hsl(${Math.max(0, -20 + 160 * score).toFixed(0)}, 85%, 75%)` : '';
          }
        });
    }

    return () => cancelled = true;
  }, [svg, colorize]);

  $('title').innerText = `NPMGraph - ${query.join(', ')}`;

  return html`
    <div id="graph" onClick=${handleGraphClick} >
      ${loadStats?.active ? html`<${Loader} complete=${loadStats.complete} total=${loadStats.active + loadStats.complete} />` : null}
      <${GraphControls} />
    </div>
  `;
}