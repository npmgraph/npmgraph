import { html, useState, useEffect, useContext } from '../vendor/preact.js';
import { AppContext } from './App.js';
import { $, tagElement, entryFromKey, report, getDependencyEntries } from './util.js';
import Store from './Store.js';

const FONT = 'Roboto Condensed, sans-serif';

const EDGE_ATTRIBUTES = {
  dependencies: '[color=black]',
  devDependencies: '[color=red]',
  peerDependencies: '[color=green]'
  // optionalDependencies: '[color=black style=dashed]',
  // optionalDevDependencies: '[color=red style=dashed]'
};

async function handleGraphClick(event) {
  const el = $.up(event.srcElement, e => e.classList.contains('node'));
  // Inspector.selectTag(el);
  // if (el) {
  //   const moduleKey = el.textContent.trim();
  //   const module = await Store.getModule(...entryFromKey(moduleKey));
  //   if (module) {
  //     Inspector.setModule(module);
  //     Inspector.showPane('pane-module');
  //     Inspector.toggle(true);
  //     return;
  //   }
  // }
  // Inspector.toggle(false);
}

function _graphWalk(m, depIncludes, accum, level = 0) {
  // Array?  Apply to each element
  if (Array.isArray(m)) {
    return Promise.all(m.map(m => _graphWalk(m, depIncludes, accum, level)));
  }

  // Skip modules we've already seen
  if (m.key in accum.seen) return;
  accum.seen[m.key] = true;

  // Add entry to nodes list
  accum.nodes.push(`"${m}"${level == 0 ? ' [root=true]' : ''}`);

  // Walk dependencies
  const renderP = [];
  for (const [dName, dVersion, dType] of getDependencyEntries(m, depIncludes, level)) {
    // Fetch dependency info
    const p = Store.getModule(dName, dVersion)
      .then(dst => {
        // Add entry to edges list
        accum.edges.push(`"${m}" -> "${dst}" ${EDGE_ATTRIBUTES[dType]}`);

        // Recurse into it
        return _graphWalk(dst, depIncludes, accum, level + 1);
      });
    renderP.push(p);
  }

  return Promise.all(renderP);
}

async function graphMarkup(moduleNames, depIncludes) {
  // Inspector.toggle(false);

  // Compose directed graph document (GraphViz notation)
  const modules = await Promise.all(moduleNames.map(moduleName =>
    Store.getModule(...entryFromKey(moduleName))
  ));

  const accum = {
    nodes: ['\n// Nodes & per-node styling'],
    edges: ['\n// Edges & per-edge styling'],
    seen: {}
  };
  await _graphWalk(modules, depIncludes, accum);

  const title = modules.map(m => m.package.name).join();
  const dotDoc = [
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
    .concat(accum.nodes.sort())
    .concat(accum.edges.sort())
    .concat(
      modules.length > 1
        ? `{rank=same; ${modules.map(s => `"${s}"`).join('; ')};}`
        : ''
    )
    .concat('}')
    .join('\n');

  return Viz(dotDoc, {
    format: 'svg',
    scale: 1,
    totalMemory: 32 * 1024 * 1024 // See https://github.com/mdaines/viz.js/issues/89
  });
}

function zoom(op) {
  const svg = $('svg');
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
  const svg = $('svg');
  const data = $('svg').outerHTML;
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
  alert('Note: Make sure you have the "Roboto Condensed" font installed, available at https://fonts.google.com/specimen/Roboto+Condensed.');

  const svgData = $('svg').outerHTML;
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

function Loader({ complete, total, ...props }) {
  const perc = complete / total * 100;
  return html`
    <div className="loader" ...${props}>
      <div className="inner" style=${{ width: `${perc}%` }} />
    </div>
  `;
}

function GraphControls() {
  return html`
    <div className="graph-controls" >
      <button onClick=${() => zoom(1)} title="zoom (fit width)" class="material-icons" style="border-radius: 3px 0 0 3px">swap_horiz</button>
      <button onClick=${() => zoom(0)} title="zoom (1:1)" class="material-icons" style="border-width: 1px 0px; border-radius: 0">search</button>
      <button onClick=${() => zoom(2)} title="zoom (fit height)" class="material-icons" style="border-radius: 0 3px 3px 0">swap_vert</button>
      <button onClick=${() => download('svg')} title="download as SVG" class="material-icons" style="margin-left: 0.5em">cloud_download</button>
    </div>
  `;
}

export default function Graph() {
  const {
    query: [query],
    depIncludes: [depIncludes],
    pane: [, setPane],
    inspectModule: [, setInspectModule],
    inspectGraph: [, setInspectGraph]
  } = useContext(AppContext);

  const [loadStats, setLoadStats] = useState(null);

  useEffect(async() => {
    $('#graph svg').remove();

    setInspectGraph([]);
    setInspectModule([]);

    // TODO: Replace Viz with Dagre
    const markup = await graphMarkup(query, depIncludes);

    setPane('graph');

    // Compose SVG markup
    const svg = new DOMParser().parseFromString(markup, 'text/html').querySelector('svg');
    $(svg, 'g title').forEach(el => el.remove());

    svg.addEventListener('click', handleGraphClick);

    // Round up viewbox
    svg.setAttribute('viewBox', svg.getAttribute('viewBox').split(' ').map(Math.ceil).join(' '));

    $(svg, 'g.node').forEach(async el => {
      const key = $(el, 'text').first.textContent;
      if (!key) return;

      const moduleName = key.replace(/@[\d.]+$/, '');
      if (moduleName) {
        tagElement(el, 'module', moduleName);
      } else {
        report.warn(Error(`Bad replace: ${key}`));
      }

      const m = await Store.getModule(...entryFromKey(key));
      const pkg = m.package;
      if (pkg.maintainers.length < 2) {
        el.classList.add('bus'); // Module maintainer might get hit by bus :-o
      }

      if (pkg.stub) {
        el.classList.add('stub');
      } else {
        tagElement(el, 'maintainer', ...pkg.maintainers.map(m => m.name));
        tagElement(el, 'license', m.licenseString || 'Unspecified');
      }
    });

    $('#graph').appendChild(svg);
    // zoom(1);

    // Inspector.setGraph(modules);
    // Inspector.setModule(modules);
    // Inspector.showPane('pane-graph');
    // Inspector.toggle(true);

    return () => {
      delete Store.onRequest;
    };
  }, [query, depIncludes]);

  $('title').innerText = `NPMGraph - ${query.join(', ')}`;

  return html`
    <div id="graph">
      ${loadStats ? html`<${Loader} complete=${loadStats.complete} total=${loadStats.active + loadStats.complete} />` : null}
      <${GraphControls} />
    </div>
  `;
}