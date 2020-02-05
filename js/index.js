/* global Viz, gtag, GA_TRACKING_ID */

import Flash from './Flash.js';
import Inspector from './Inspector.js';
import Module from './Module.js';
import Store from './Store.js';
import {$, $$, tagElement, ajax, entryFromKey, report} from './util.js';

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

async function graph(module) {
  Inspector.toggle(false);

  // Clear out graphs
  $$('svg').forEach(el => el.remove());

  const FONT='Roboto Condensed, sans-serif';

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

    const deps = m.package.dependencies;
    if (deps) {
      const renderP = [];
      for (const dep in deps) {
        renderP.push(Store.getModule(dep, deps[dep])
          .then(dst => {
            edges.push(`"${m}" -> "${dst}"`);
            return render(dst);
          })
        );
      }

      return Promise.all(renderP);
    }

    return Promise.resolve();
  }

  $('#progress').style.display = 'block';
  let modules = module;
  if (typeof(module) == 'string') {
    modules = module.split(/[, ]+/);
    modules.sort();

    // Because this is a single-page app that relies on other servers to do most
    // of the heavy lifting (e.g. npmjs.cl, npmjs.org), my weblogs don't actually
    // contain info about the modules people are graphing.  Because that
    // information is kind of interesting, we make a tracking request here to
    // capture that info.
    if (location.hostname == 'npm.broofa.com') ajax('GET', `/track.php?q=${modules.join()}`);

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
      modules.length > 1 ?
        `{rank=same; ${modules.map(s => `"${s}"`).join('; ')};}` :
        ''
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

  $$('.progress').forEach(el => el.remove());
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
    const pkg = m && m.package;
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
  $$('#tabs .button').forEach((button, i) => {
    button.onclick = () => Inspector.showPane(button.getAttribute('data-pane'));
    if (!i) button.onclick();
  });

  $('#clearButton').onclick = Store.clear;
  $('#toggleInspectorButton').onclick = Inspector.toggle;
  $('#searchText').onchange = async function() {
    const noCache = /noCache/i.test(location.search);
    const url = `${location.pathname}?q=${this.value}`;
    history.pushState({}, null, `${url}${noCache ? '&noCache' : ''}`);
    gtag('config', GA_TRACKING_ID, {page_path: url}); // eslint-disable-line camelcase
    await graph(this.value);
  };

  $$('section > h2').forEach(el => {
    el.onclick = () => el.closest('section').classList.toggle('closed');
  });

  $('#zoomWidthButton').onclick = () => zoom(1);
  $('#zoomDefaultButton').onclick = () => zoom(0);
  $('#zoomHeightButton').onclick = () => zoom(2);

  Store.init();
  Inspector.init();
  Inspector.showPane('pane-info');

  /** Loads a `File` object as a package.json. */
  async function loadPackageJSON(file) {
    if (file.type && file.type != 'application/json') return alert('File must have a ".json" extension');
    if (!file) return alert('Please drop a file, not... well... whatever else it was you dropped');

    const reader = new FileReader();

    const content = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.readAsText(file);
    });

    const module = new Module(JSON.parse(content));
    history.pushState({module}, null, `${location.pathname}?upload=${file.name}`);
    graph(module);
  }

  // Handle file chooser submit
  const uploadFileRef = $('#upload_file');
  Object.assign(uploadFileRef, {
    onsubmit: async ev => {
      ev.preventDefault();

      // get file from upload `input`
      const formData = new FormData(uploadFileRef);
      const file = formData.get('file');
      if (!file) return alert('No files found in file upload');

      return loadPackageJSON(file);
    }
  });

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
      const file = item.getAsFile();

      return loadPackageJSON(file);
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

  // Show storage
  let chars = 0;
  const ls = localStorage;
  for (let i = 0; i < ls.length; i++) chars += ls.getItem(ls.key(i)).length;
  $('#storage').innerText = `${chars} chars`;
  $('#tabs input').focus();

  onpopstate();
};
