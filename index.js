'use strict';

const $ = (...args) => (args[0].querySelector ? args.shift() : document)
  .querySelector(...args);
const $$ = (...args) => (args[0].querySelectorAll ? args.shift() : document)
  .querySelectorAll(...args);
$.up = (el, test) => {
  while (el && !test(el)) el = el.parentElement;
  return el;
};

const EXPIRE = 24 * 60 * 60 * 1000;

/**
 * HTTP request api backed by localStorage cache
 */
class Store {
  static init() {
    this._inflight = {};
    this._moduleCache = {};
  }

  // GET package info
  static async getModule(name, version='latest') {
    const path = `${name.replace(/\//g, '%2F')}/${version}`;

    if (!this._moduleCache[path]) {
      let body;
      try {
        body = await this.get(path);
      } catch(err) {
        console.error('Failed to load', path);
        body = {stub: true, name, version, maintainers: []};
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
    if (stored) return stored;

    return new Promise((resolve, reject) => {
      const loader = new Loader(path);
      $('#load').appendChild(loader.el);

      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.readyState == 1) loader.start();
        if (xhr.readyState < 4) return;
        if (xhr.status >= 200 && xhr.status < 300) {
          loader.stop();
          const body = JSON.parse(JSON.parse(xhr.responseText).body);
          this.store(path, body);
          resolve(body);
        } else {
          loader.error();
          reject(xhr.status);
        }
      };
      const url = `https://registry.npmjs.org/${path}`;
      xhr.open('GET', `http://cors-proxy.htmldriven.com/?url=${encodeURIComponent(url)}`);
      xhr.send();
    });
  }

  // Store a value in localStorage, purging if there's an error
  static store(key, obj) {
    try {
      if (obj && typeof(obj) == 'object') obj._storedAt = Date.now();
      localStorage.setItem(key, JSON.stringify(obj));
    } catch (err) {
      console.error('Error while storing. Purging cache', err);
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
        console.log('Tag click', tag);
        $$('svg .node').forEach(el => el.classList.remove('selected'));
        $$(`svg .node.${tag}`).forEach((el, i) => {
          el.classList.add('selected');
          if (!i) document.body.scrollIntoView(el);
        });
      }
    });
  }

  static async handleFile(files) {
    const fr = new FileReader();
    fr.onload = () => {
      const module = new Module(JSON.parse(fr.result));
      graph(module);
    }
    fr.readAsText(files[0]);
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

  static open() {
    $('body').classList.add('open');
  }

  static close() {
    $('body').classList.remove('open');
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
      (pkg.maintainers || []).forEach(u => maintainers[u.name] = (maintainers[u.name] || 0) + 1);
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

  static setModule(module) {
    const pkg = module.package || module;

    $('#pane-module h2').innerHTML = `${module.key} Info`;
    $('#pane-module .description').innerHTML = `${module.package.description}`;
    $('#pane-module .maintainers').innerHTML = (pkg.maintainers || []).map(u => `<span>${u.name}</span>`).join('\n');
    $('#pane-module .licenses').innerHTML = renderLicense(toLicense(pkg));
    $('#pane-module .json').innerText = JSON.stringify(pkg, null, 2);

    $('#inspector').scrollTo(0, 0);
  }
}

function entryFromKey(key) {
  const x = key.lastIndexOf('@');
  return x >= 0 ? [key.substr(0,x), key.substr(x+1)] : [key];
}

async function handleGraphClick(event) {
  const el = $.up(event.srcElement, e => e.nodeName == 'text');
  if (el) {
    const module = await Store.getModule(...entryFromKey(el.innerHTML));
    if (module) {
      Inspector.setModule(module);
      Inspector.showPane('pane-module');
      Inspector.open();
      return;
    }
  }
  Inspector.close();
}

async function graph(module) {
  console.log('Graphing', module.key || module);

  // Clear out graphs
  $$('svg').forEach(el => el.remove());

  const FONT='GillSans-Light';

  // Build us a directed graph document in GraphViz notation
  const nodes = ['\n// Nodes & per-node styling'];
  const edges = ['\n// Edges & per-edge styling'];

  const seen = {};
  async function render(m) {
    if (m.key in seen) return;
    seen[m.key] = true;

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
    'digraph {',
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
    .concat('}')
    .join('\n');

  // https://github.com/mdaines/viz.js/ is the most underappreciated JS
  // library on the internet.
  const dot = Viz(dotDoc, {format: 'svg'});

  // We could just `document.body.innerHTML = dot` here, but we don't want to
  // kill our other content So we parse the doc and pull out the SVG element we
  // want, then add it to our body.
  const svg = new DOMParser().parseFromString(dot, 'text/html').querySelector('svg');
  svg.querySelectorAll('.node title').forEach(el => el.remove());
  svg.addEventListener('click', handleGraphClick);

  $('#graph').appendChild(svg);

  $$('.loader').forEach(el => el.remove());
  $$('g.node').forEach(async el => {
    const key = $(el, 'text').textContent;
    if (!key) return;
    const m = await Store.getModule(...entryFromKey(key));
    const pkg = m && m.package;
    el.classList.add(toTag('module', key.replace(/@.*/, '')));
    (pkg.maintainers || []).forEach(m => el.classList.add(toTag('maintainer', m.name)));
    el.classList.add(toTag('license', toLicense(pkg)));
    if (pkg.stub) el.classList.add('stub');
  });

  Inspector.setGraph(module);
  Inspector.setModule(module);
  Inspector.showPane('pane-graph');
  Inspector.open();
}

window.onpopstate = async function() {
  const target = /q=([^&]+)/.test(location.search) && RegExp.$1;
  graph(target || 'request');
};

onload = function() {
  $$('#tabs .button').forEach((button, i) => {
    button.onclick = () => Inspector.showPane(button.getAttribute('data-pane'));
    if (!i) button.onclick();
  });

  Store.init();
  Inspector.init();

  window.onpopstate();

  // Show storage
  let chars = 0;
  let ls = localStorage;
  for (let i = 0; i < ls.length; i++) chars += ls.getItem(ls.key(i)).length;
  $('#storage').innerText = `${chars} chars`;
};
