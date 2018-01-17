import Inspector from './Inspector.js';
import Store from './Store.js';
import {$, $$, ajax, toTag, toLicense, renderMaintainer} from './util.js';

// Max time (msecs) to rely on something in localstore cache
const EXPIRE = 24 * 60 * 60 * 1000;

const MODULE_RE = /^(@?[^@]+)(?:@(.*))?$/;

function entryFromKey(key) {
  if (!MODULE_RE.test(key)) console.log('Invalid key', key);

  return RegExp.$2 ? [RegExp.$1, RegExp.$2] : [RegExp.$1];
}

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

  // Build us a directed graph document in GraphViz notation
  const nodes = ['\n// Nodes & per-node styling'];
  const edges = ['\n// Edges & per-edge styling'];

  const seen = {};
  async function render(m) {
    if (m.key in seen) return;
    seen[m.key] = true;

    nodes.push(`"${m}"`);

    let deps = m.package.dependencies;
    if (deps) {
      const renderP = [];
      for (let dep in deps) {
        renderP.push(Store.getModule(dep, deps[dep])
          .then(dst => {
            edges.push(`"${m}" -> "${dst}"`);
            return render(dst);
          })
        );
      }
      return Promise.all(renderP);
    }
  }

  $('#load').style.display = 'block';
  if (typeof(module) == 'string') {
    module = await Store.getModule(...entryFromKey(module));
  }
  await render(module);
  $('#load').style.display = 'none';

  const dotDoc = [
    'digraph \{',
    'rankdir="LR"',
    'labelloc="t"',
    `label="${module.package.name}"`,
    '// Default styles',
    `graph [fontsize=16 fontname="${FONT}"]`,
    `node [shape=box fontname="${FONT}" fontsize=11 height=0 width=0 margin=.04]`,
    `edge [fontsize=10, fontname="${FONT}" splines="polyline"]`,
    ''
  ]
    .concat(nodes)
    .concat(edges)
    .concat('\}')
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
  zoom(0);

  $$('.loader').forEach(el => el.remove());
  $$('g.node').forEach(async el => {
    const key = $(el, 'text').textContent;
    if (!key) return;
    const m = await Store.getModule(...entryFromKey(key));
    const pkg = m && m.package;
    el.classList.add(toTag('module', key.replace(/@.*/, '')));
    pkg.maintainers.forEach(m => el.classList.add(toTag('maintainer', m.name)));
    el.classList.add(toTag('license', toLicense(pkg)));
    if (pkg.stub) el.classList.add('stub');
  });

  Inspector.setGraph(module);
  Inspector.setModule(module);
  Inspector.showPane('pane-graph');
  Inspector.toggle(true);
  $('title').innerText = `NPMGraph - ${module.key}`;
}

window.onpopstate = function() {
  const target = /q=([^&]+)/.test(location.search) && RegExp.$1;
  if (target) graph(target || 'request');
};

onload = function() {
  $$('#tabs .button').forEach((button, i) => {
    button.onclick = () => Inspector.showPane(button.getAttribute('data-pane'));
    if (!i) button.onclick();
  });

  $('#clearButton').onclick=Store.clear;
  $('#toggleInspectorButton').onclick=Inspector.toggle;
  $('#searchText').onchange = async function() {
    const term = this.value;
    const noCache = /noCache/i.test(location.search);
    history.pushState({}, null, `${location.pathname}?q=${term}${noCache ? '&noCache' : ''}`);
    await graph(term);
  };

  Store.init();
  Inspector.init();
  Inspector.showPane('pane-info');

  // Handle file drops
  Object.assign($('#drop_target'), {
    ondrop: async ev => {
      ev.target.classList.remove('drag');
      ev.preventDefault();

      // If dropped items aren't files, reject them
      var dt = ev.dataTransfer;
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
      graph(module);
    },

    ondragover: ev => {
      ev.target.classList.add('drag');
      ev.preventDefault();
    },

    ondragleave: ev => {
      // Going to child != leaving
      if (ev.toElement.closest('#drop_target')) return;
      ev.target.classList.remove('drag');
      ev.preventDefault();
    }
  });

  // Show storage
  let chars = 0;
  let ls = localStorage;
  for (let i = 0; i < ls.length; i++) chars += ls.getItem(ls.key(i)).length;
  $('#storage').innerText = `${chars} chars`;
  $('#tabs input').focus();

  onpopstate();
};
