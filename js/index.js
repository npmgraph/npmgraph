/* global Viz, gtag, GA_TRACKING_ID */

import Flash from './Flash.js';
import Inspector from './Inspector.js';
import Module from './Module.js';
import Store from './Store.js';
import { $, $$, tagElement, entryFromKey, report } from './util.js';

// HACK: So we can call closest() on event targets without having to worry about
// whether or not the user clicked on an Element v. Text Node
Text.prototype.closest = function(...args) {
  return this.parentNode.closest && this.parentNode.closest(...args);
};

// Used to feature-detect that es6 modules are loading
window.indexLoaded = true;

window.addEventListener('error', err => {
  console.error(err);
  Flash(err.message);
});

window.addEventListener('unhandledrejection', err => {
  console.error(err);
  Flash(err.reason);
});

async function handleGraphClick(event) {
  const el = $.up(event.srcElement, e => e.classList.contains('node'));
  Inspector.selectTag(el);
  if (el) {
    const moduleKey = el.textContent.trim();
    const module = await Store.getModule(...entryFromKey(moduleKey));
    if (module) {
      Inspector.setModule(module);
      Inspector.showPane('pane-module');
      Inspector.toggle(true);
      return;
    }
  }
  Inspector.toggle(false);
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

  const canvas = document.createElement('canvas');
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
  const svgData = $('svg').outerHTML;
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  generateLinkToDownload('svg', svgUrl);
}

function generateLinkToDownload(extension, link) {
  const name = $('title').innerText.replace(/.*- /, '').replace(/\W+/g, '_');
  const downloadLink = document.createElement('a');
  downloadLink.href = link;
  downloadLink.download = `${name}_dependencies.${extension}`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

async function graph(module) {
  Inspector.toggle(false);

  // Clear out graphs
  $$('svg').forEach(el => el.remove());

  const FONT = 'Roboto Condensed, sans-serif';

  // Compose directed graph document (GraphViz notation)
  const nodes = ['\n// Nodes & per-node styling'];
  const edges = ['\n// Edges & per-edge styling'];

  const seen = {};
  function render(m) {
    if (Array.isArray(m)) {
      return Promise.all(m.map(render));
    }

    if (m.key in seen) return;
    seen[m.key] = true;

    nodes.push(`"${m}"`);

    const depList = [
      m.package.dependencies
      // m.package.devDependencies,
      // m.package.peerDependencies,
      // m.package.optionalDependencies,
      // m.package.optionalDevDependencies
    ];

    const renderP = [];
    for (const deps of depList) {
      if (!deps) continue;
      for (const dep in deps) {
        const p = Store.getModule(dep, deps[dep])
          .then(dst => {
            edges.push(`"${m}" -> "${dst}"`);
            return render(dst);
          });
        renderP.push(p);
      }
    }
    return Promise.all(renderP);
  }

  $('#progress').style.display = 'block';
  let modules = module;
  if (typeof (module) == 'string') {
    modules = module.split(/[, ]+/);
    modules.sort();

    modules = await Promise.all(modules.map(moduleName =>
      Store.getModule(...entryFromKey(moduleName))
    ));
  } else {
    modules = [module];
  }
  await render(modules);
  $('#progress').style.display = 'none';

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
    .concat(nodes)
    .concat(edges)
    .concat(
      modules.length > 1
        ? `{rank=same; ${modules.map(s => `"${s}"`).join('; ')};}`
        : ''
    )
    .concat('}')
    .join('\n');

  // https://github.com/mdaines/viz.js/ is easily the most underappreciated JS
  // library on the internet.
  const dot = Viz(dotDoc, {
    format: 'svg',
    scale: 1,
    totalMemory: 32 * 1024 * 1024 // See https://github.com/mdaines/viz.js/issues/89
  });

  // We could just `$('#graph').innerHTML = dot` here, but we want to finesse
  // the svg DOM a bit, so we parse it into a DOMFragment and then add it.
  const svg = new DOMParser().parseFromString(dot, 'text/html').querySelector('svg');
  svg.querySelectorAll('g title').forEach(el => el.remove());
  svg.addEventListener('click', handleGraphClick);

  // Round up viewbox
  svg.setAttribute('viewBox', svg.getAttribute('viewBox').split(' ').map(Math.ceil).join(' '));

  $('#graph').appendChild(svg);
  zoom(1);

  $$('.progress').innerHTML = '';
  $$('g.node').forEach(async el => {
    const key = $(el, 'text').textContent;
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

  Inspector.setGraph(modules);
  Inspector.setModule(modules);
  Inspector.showPane('pane-graph');
  Inspector.toggle(true);

  const names = modules.map(m => m.package.name).join(', ');
  $('title').innerText = `NPMGraph - ${names}`;
}

window.onpopstate = function(event) {
  const state = event && event.state;
  if (state && state.module) {
    graph(state.module);
    return;
  }
  const target = /q=([^&]+)/.test(location.search) && RegExp.$1;
  if (target) graph(decodeURIComponent(target) || 'request');
};

onload = function() {
  Store.onRequest = function(stats) {
    const n = stats.active + stats.complete;
    const el = $('#progress_inner');
    el.style.width = `${stats.complete / n * 100}%`;
    el.innerHTML = `Loading ${stats.complete} of ${n} modules`;
  };

  $$('#tabs .button').forEach((button, i) => {
    button.onclick = () => Inspector.showPane(button.getAttribute('data-pane'));
    if (!i) button.onclick();
  });

  $('#toggleInspectorButton').onclick = Inspector.toggle;
  $('#searchText').onchange = async function() {
    const noCache = /noCache/i.test(location.search);
    const url = `${location.pathname}?q=${this.value}`;
    history.pushState({}, null, `${url}${noCache ? '&noCache' : ''}`);
    gtag('config', GA_TRACKING_ID, { page_path: url }); // eslint-disable-line camelcase
    await graph(this.value);
  };

  $$('section > h2').forEach(el => {
    el.onclick = () => el.closest('section').classList.toggle('closed');
  });

  $('#zoomWidthButton').onclick = () => zoom(1);
  $('#zoomDefaultButton').onclick = () => zoom(0);
  $('#zoomHeightButton').onclick = () => zoom(2);
  $('#downloadButton').onclick = () => download('svg');

  Store.init();
  Inspector.init();
  Inspector.showPane('pane-info');

  // Handle file drops
  Object.assign($('#drop_target'), {
    ondrop: async ev => {
      ev.target.classList.remove('drag');
      ev.preventDefault();

      // If dropped items aren't files, reject them
      const dt = ev.dataTransfer;
      if (!dt.items) return alert('Sorry, file dropping is not supported by this browser');
      if (dt.items.length != 1) return alert('You must drop exactly one file');

      const item = dt.items[0];
      if (item.type && item.type != 'application/json') return alert('File must have a ".json" extension');

      const file = item.getAsFile();
      if (!file) return alert('Please drop a file, not... well... whatever else it was you dropped');

      const reader = new FileReader();

      const content = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsText(file);
      });

      const module = new Module(JSON.parse(content));
      history.pushState({ module }, null, `${location.pathname}?upload=${file.name}`);
      graph(module);
    },

    ondragover: ev => {
      ev.target.classList.add('drag');
      ev.preventDefault();
    },

    ondragleave: ev => {
      ev.currentTarget.classList.remove('drag');
      ev.preventDefault();
    }
  });

  $('#tabs input').focus();

  onpopstate();
};