'use strict';

// Author's note: I know, I know, it's bad form to have all my JS source in one
// file.  The intent is to break this out into ES6-compatible modules/files at
// some point.

// Max time (msecs) to rely on something in localstore cache
const EXPIRE = 24 * 60 * 60 * 1000;

/**
 * Thin wrapper around querySelector()
 */
const $ = (...args) => (args[0].querySelector ? args.shift() : document)
  .querySelector(...args);

/**
 * Thin wrapper around querySelectorAll()
 */
const $$ = (...args) => (args[0].querySelectorAll ? args.shift() : document)
  .querySelectorAll(...args);

/**
 * Like Array#find(), but for DOMElement ancestors
 */
$.up = (el, test) => {
  while (el && !test(el)) el = el.parentElement;
  return el;
};

/**
 * Simple ajax request support.  Supports different HTTP methods, but (for the
 * moment) does not support sending a request body because we don't (yet) need
 * that feature.
 */
async function ajax(method, url, loader) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState < 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        if (loader) loader.stop();
        resolve(JSON.parse(xhr.responseText));
      } else {
        if (loader) loader.error();
        reject(xhr.status);
      }
    };

    xhr.open(method, url);
    xhr.send();
  });
}

/**
 * HTTP request api backed by localStorage cache
 */
class Store {
  static init() {
    this._inflight = {};
    this._moduleCache = {};
    this._noCache = /noCache/i.test(location.search);
  }

  // GET package info
  static async getModule(name, version) {
    let path = `${name.replace(/\//g, '%2F')}`;
    if (version) path += `/${version}`;

    if (!this._moduleCache[path]) {
      let body;
      try {
        body = await this.get(path);
        if (!body) throw Error('No module info found');
        if (typeof(body) != 'object') throw Error('Response was not an object');
      } catch(err) {
        console.error('Failed to load', path, err);
        body = {stub: true, name, version, maintainers: []};
      }

      // If fetched a path with no version, NPM repo returns info about *all*
      // versions, so pick the most appropriate one
      if (body.versions) {
        let vname;
        if ('dist-tags' in body && 'latest' in body['dist-tags']) {
          // Use version specified by 'latest' dist-tag
          vname = body['dist-tags'].latest;
        }
        if (!vname) {
          // Use most recent version
          // TODO: use highest semver instead of most recently published version
          const times = Object.keys(body.time);
          times.sort((a,b) => {
            a = Date.parse(a);
            b = Date.parse(b);
            return a < b ? -1 : a > b ? 1 : 0;
          });
          vname = times.pop();
        }

        body = body.versions[vname]
      }

      const versionPath = `${body.name.replace(/\//g, '%2F')}/${body.version}`;

      if (!body.stub && path != versionPath) {
        this.store(path, versionPath);
        this.store(versionPath, body);
      }

      this._moduleCache[versionPath] = this._moduleCache[path] = new Module(body);
    };

    return this._moduleCache[path];
  }

  // GET package stats
  static async getStats(name) {
    const path = `${name.replace(/\//g, '%2F')}/${version}`;
    return await this.get(path);
  }

  // GET url, caching results in localStorage
  static get(path) {
    // In store?
    const stored = this.unstore(path);

    // In store?
    if (stored && !this._noCache) return stored;

    const loader = new Loader(path);
    $('#load').appendChild(loader.el);
    return ajax('GET', `https:/\/registry.npmjs.cf/${path}`, loader);
  }

  // Store a value in localStorage, purging if there's an error
  static store(key, obj) {
    try {
      if (obj && typeof(obj) == 'object') obj._storedAt = Date.now();
      localStorage.setItem(key, JSON.stringify(obj));
    } catch (err) {
      console.warn('Error while storing. Purging cache', err);
      this.purge();
    }
  }

  // Recover a value from localStorage
  static unstore(key) {
    let obj;
    for (let i = 0; i < 10; i++) {
      obj = localStorage.getItem(key);
      if (obj) obj = JSON.parse(obj);
      if (!obj || typeof(obj) != 'string') break;
      key = obj;
    }

    return (obj && obj._storedAt > Date.now() - EXPIRE) ? obj : null;
  }

  // Remove oldest half of store
  static purge() {
    const ls = localStorage;

    // List of entries
    const entries = new Array(ls.length).fill()
      .map((v, i) => [ls.key(i), JSON.parse(ls.getItem(ls.key(i)))]);

    // Get oldest 50% of entries
    let prune = entries.filter(entry => entry[1]._storedAt > 0)
      .sort((a, b) => {
        a = a._storedAt;
        b = b._storedAt;
        return a < b ? -1 : a > b ? 1 : 0;
      });
    prune = prune.slice(0, Math.max(1, prune.length >> 1));

    // Copile list of names to prune
    const names = {};
    prune.forEach(e => names[e[0]] = true);
    entries.filter(e => names[e[0]] || names[e[1]]).forEach(e => ls.removeItem(e[0]));
  }

  static clear() {
    localStorage.clear();
  }
}

/**
 * UI widget for showing XHR load progress
 */
class Loader {
  constructor(name) {
    this.name = name;
    this.el = document.createElement('div');
    this.el.className = 'loader';
    this.el.innerText = name;
    this.el.insertBefore(document.createElement('span'), this.el.firstChild);
    $('#load').appendChild(this.el);
  }

  start() {
    this.el.classList.add('active');
  }

  stop() {
    this.el.classList.remove('active');
    this.el.classList.add('success');
  }

  error() {
    this.el.classList.remove('active');
    this.el.classList.add('error');
  }
}

class Module {
  static key(name, version) {
    return `${name}@${version}`;
  }

  constructor(pkg) {
    if (!pkg.maintainers) {
      pkg.maintainers = [];
    } else if (!Array.isArray(pkg.maintainers)) {
      pkg.maintainers = [pkg.maintainers];
    }
    this.package = pkg;
  }

  get key() {
    return Module.key(this.package.name, this.package.version);
  }

  toString() {
    return this.key;
  }

  toJSON() {
    return this.package;
  }
}

const toTag = (type, text) => {
  // .type for license objects
  // .name for maintainer objects
  text = text.type || text.name || text;

  return type + '-' + text.replace(/\W/g, '_').toLowerCase();
};

const toLicense = pkg => {
  const license = Array.isArray(pkg.licenses) ? pkg.licenses[0] : pkg.license;
  return (license && license.type) || license || 'None'
};

const renderTag = (type, text, count = 0) => {
  const tag = toTag(type, text);
  text = count < 2 ? text : `${text}(${count})`;

  return `<span class="tag ${type}" data-tag="${tag}">${text}</span>`;
};
const renderMaintainer = (maintainer, count) => renderTag('maintainer', maintainer, count);
const renderLicense = (license, count) => renderTag('license', license, count);
const renderModule = (name, count) => renderTag('module', name, count);

class Inspector {
  static init() {
    const el = $('#inspector');
    el.addEventListener('click', event => {
      const el = $.up(event.srcElement, e => e.getAttribute('data-tag'));

      if (el) {
        const tag = el.getAttribute('data-tag');
        Inspector.selectTag(tag);
      }
    });
  }

  static selectTag(tag) {
    $$('svg .node').forEach(el => el.classList.remove('selected'));
    if (typeof(tag) == 'string') {
        $$(`svg .node.${tag}`).forEach((el, i) => el.classList.add('selected'));
    } else if (tag) {
        tag.classList.add('selected');
    }
  }

  static async handleSearch(term) {
    history.pushState({}, null, `${location.pathname}?q=${term}`);
    await graph(term);
  }

  static showPane(id) {
    $$('#inspector #tabs .button').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-pane') == id);
    });
    $$('#inspector .pane').forEach(pane => {
      pane.classList.toggle('open', pane.id == id);
    });
  }

  static toggle(open) {
    const body = $('body');
    if (open == null) open = !body.classList.contains('open');
    $('#tabs .arrow').innerHTML = open ? '&#x25ba' : '&#x25c0';
    $('body').classList.toggle('open', open);
  }

  static async setGraph(module) {
    const deps = {};
    const depCount = {};
    let maintainers = {};
    let licenses = {};

    async function walk(m) {
      const pkg = m.package;
      const license = toLicense(pkg);

      if (!m || (m.key in deps)) return;

      deps[m.key] = m;
      depCount[pkg.name] = (depCount[pkg.name] || 0) + 1;
      pkg.maintainers.forEach(u => maintainers[u.name] = (maintainers[u.name] || 0) + 1);
      licenses[license] = (licenses[license] || 0) + 1;
      return Promise.all(Object.entries(pkg.dependencies || {})
        .map(async e => walk(await Store.getModule(...e))));
    }

    await walk(module);

    const depList = Object.entries(deps);
    maintainers = Object.entries(maintainers).sort().map(e => renderMaintainer(...e));
    licenses = Object.entries(licenses).sort().map(e => renderLicense(...e));

    $('#pane-graph h2').innerHTML = `${depList.length} Modules`;
    $('#pane-graph .dependencies').innerHTML = Object.entries(depCount).map(e => renderModule(e[0], e[1])).sort().join('');
    $('#pane-graph .maintainers').innerHTML = maintainers.join('');
    $('#pane-graph .licenses').innerHTML = licenses.join('');

    $('#inspector').scrollTo(0, 0);
  }

  static async setModule(module) {
    const pkg = module.package || module;

    $('#pane-module h2').innerHTML = `${module.key} Info`;
    $('#pane-module .description').innerHTML = `${module.package.description}`;
    $('#pane-module .json').innerText = JSON.stringify(pkg, null, 2);

    $('#inspector').scrollTo(0, 0);

    $('#pane-module .stats').innerHTML = '(Getting info...)';

    const [stats, search] = await Promise.all([
      ajax('GET', `https:/\/api.npmjs.org/downloads/point/last-week/${module.package.name}`),
      ajax('GET', `https:/\/registry.npmjs.org/-/v1/search?text=${module.package.name}&size=1`)
    ]);

    const scores = search.objects[0].score.detail;
    $('#pane-module .stats').innerHTML = `
        <table>
        <tr><th>Maintainers</td><td>${pkg.maintainers.map(u => `<span>${u.name}</span>`).join('\n')}</td></tr>
        <tr><th>License</td><td>${renderLicense(toLicense(pkg))}</td></tr>
        <tr><th>Downloads/week</td><td>${stats.downloads}</td></tr>
        <tr><th>Quality</td><td>${(scores.quality*100).toFixed(0)}%</td></tr>
        <tr><th>Popularity</td><td>${(scores.popularity*100).toFixed(0)}%</td></tr>
        <tr><th>Maintenance</td><td>${(scores.maintenance*100).toFixed(0)}%</td></tr>
        </table>
        `;
  }
}

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
  const dot = Viz(dotDoc, {format: 'svg', scale: 1});

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
      if (item.type != 'application/json') return alert('File must have a ".json" extension');

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
