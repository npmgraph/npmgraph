const _modules = {};

const $ = (...args) => {
  return (args[0].querySelector ? args.shift() : document)
    .querySelector(...args);
}
const $$ = (...args) => {
  return (args[0].querySelectorAll ? args.shift() : document)
    .querySelectorAll(...args);
}
$.up = (el, test) => {
  while (el && !test(el)) el = el.parentElement;
  return el;
}

function cacheModules() {
  console.time('Cache');
  const obj = {};
  const expire = Date.now() - 3 * 24 * 60 * 60 * 1000;
  for (const k in _modules) {
    // Drop from cache?
    if (_modules[k].package.fetchedAt < expire) continue;

    if (k == _modules[k].key) {
      obj[k] = _modules[k];
    } else {
      obj[k] = _modules[k].key;
    }
  }

  try {
    localStorage.setItem('modules', JSON.stringify(obj));
  } catch(err) {
    // If save fails, clear
    console.error(err);
    localStorage.removeItem('modules');
  }
  console.timeEnd('Cache');
}

function uncacheModules() {
  console.time('Uncache');
  let obj = localStorage.getItem('modules');
  if (!obj) return;
  try {
    obj = JSON.parse(obj);
  } catch (err) {
    // If read fails, clear
    console.error(err);
    localStorage.removeItem('modules');
    return;
  }

  for (const k in obj) {
    if (typeof(obj[k]) == 'object') _modules[k] = new Module(obj[k]);
  }
  for (const k in obj) {
    const v = obj[k]
    if (typeof(v) == 'string') _modules[k] = _modules[v];
  }
  console.timeEnd('Uncache');
}

async function fetch(path, loader) {
  const url = `https://registry.npmjs.org/${encodeURIComponent(path)}`;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 1) loader.start();
        if (xhr.readyState < 4) return;
        loader.stop();
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.responseText);
        } else {
          reject(xhr.status);
        }
      }
      xhr.open('GET', `http://cors-proxy.htmldriven.com/?url=${url}`);
      xhr.send();
    });
}

// Map of module name -> fetch promise.  Used to avoid race conditions where
// requests for different module semvers may resolve to the same module
const _inFlight = {};

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
  static async get(name, version = 'latest') {
    const key = this.key(name, version);
    let module = _modules[key];
    if (module) {
    } else {
      // Only fetch one version of a module at a time
      if (!_inFlight[name]) _inFlight[name] = Promise.resolve();
      const path = `${name.replace(/\//g, '%2F')}/${version}`;
      const loader = new Loader(path);
      _inFlight[name] = _inFlight[name]
        .then(() => fetch(path, loader))

      let obj, pkg;
      try {
        const json = await _inFlight[name];
        obj = JSON.parse(json);
        pkg = JSON.parse(obj.body);
        pkg.fetchedAt = Date.now();
      } catch (err) {
        debugger;
      }
      const newModule = new Module(pkg);

      if (_modules[newModule.key]) {
        module = _modules[newModule.key];
      } else {
        module = newModule;
      }

      _modules[key] = _modules[module.key] = module;
    }

    return module;
  }

  static key(name, version) {
    return `${name}@${version}`
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

const renderTag = (type, text, count) => {
  const tag = toTag(type, text);
  text = count == null ? text : `${text}(${count})`;

  return `<span class="tag ${type}" data-tag="${tag}">${text}</span>`;
}
const renderMaintainer = (maintainer, count) => renderTag('maintainer', maintainer, count);
const renderLicense = (license, count) => renderTag('license', license, count);
const renderModule = module => renderTag('module', module.key);

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
  static showPane(id) {
    $$('#inspector #tabs .button').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-pane') == id)
    });
    $$('#inspector .pane').forEach(pane => {
      pane.classList.toggle('open', pane.id == id);
    })
  }

  static open() {
      $('body').classList.add('open');
  }

  static close() {
      $('body').classList.remove('open');
  }

  static showGraph(module) {
    const deps = {};
    let maintainers = {};
    let licenses = {};
    function walk(m) {
      const pkg = m.package
      const license = pkg.license || 'Unspecified';
      if (!m || (pkg.name in deps)) return;
      deps[pkg.name] = m;
      (pkg.maintainers || []).forEach(u => maintainers[u.name] = (maintainers[u.name] || 0) + 1);
      licenses[license] = (licenses[license] || 0) + 1;
      Object.entries(pkg.dependencies || {}).map(e => _modules[Module.key(...e)]).forEach(walk);
    }
    walk(module);
    const depList = Object.entries(deps);
    maintainers = Object.entries(maintainers).sort().map(e => renderMaintainer(...e));
    licenses = Object.entries(licenses).sort().map(e => renderLicense(...e));

    $('#pane-graph h2').innerHTML = `${depList.length} Modules`;
    $('#pane-graph .dependencies').innerHTML = depList.map(e => renderModule(e[1])).sort().join('');
    $('#pane-graph .maintainers').innerHTML = maintainers.join('');
    $('#pane-graph .licenses').innerHTML = licenses.join('');
  }

  static showModule(module) {
    const pkg = module.package || module;

    $('#pane-module h2').innerHTML = `${module.key} Info`;
    $('#pane-module .description').innerHTML = `${module.package.description}`;
    $('#pane-module .maintainers').innerHTML = pkg.maintainers.map(u => `<span>${u.name}</span>`).join('\n');
    $('#pane-module .licenses').innerText = pkg.license || '<i>Unknown</i>';

    $('#pane-package h2').innerText = `${module.key} package.json`;
    $('#pane-package .json').innerText = JSON.stringify(pkg, null, 2);
  }
};

function handleGraphClick(event) {
  const el = $.up(event.srcElement, e => e.nodeName == 'text');
  if (el) {
    const module = _modules[el.innerHTML];
    if (module) {
      Inspector.showModule(module);
      Inspector.showPane('pane-module');
      Inspector.open();
      return;
    }
  }
      Inspector.close();
}

async function graph(name) {
  const FONT='GillSans-Light';

  // Build us a directed graph document in GraphViz notation
  const nodes = ['\n// Nodes & per-node styling'];
  const edges = ['\n// Edges & per-edge styling'];

  const seen = new Set();
  async function render(src) {
    if (seen.has(src)) return;
    seen.add(src);

    let deps = src.package.dependencies;

    if (deps) {
      const renderP = [];
      for (dep in deps) {
        renderP.push(Module.get(dep, deps[dep])
          .then(dst => {
            edges.push(`"${src}" -> "${dst}"`);
            return render(dst);
          })
        );
      }
      return Promise.all(renderP);
    }
  }

  $('#load').style.display = 'block';
  const module = await Module.get(...name.split('@'));
  await render(module);
  $('#load').style.display = 'none';

  const dotDoc = [
    `digraph {`,
    `rankdir="LR"`,
    `labelloc="t"`,
    `label="${module.package.name}"`,
    `// Default styles`,
    `graph [fontname="${FONT}"]`,
    `node [shape=box fontname="${FONT}" fontsize=11 height=0 width=0 margin=.04]`,
    `edge [fontsize=10, fontname="${FONT}" splines="polyline"]`,
    ``
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
  svg.addEventListener('click', handleGraphClick);
  $('#graph').appendChild(svg);


  $$('.loader').forEach(el => el.remove());
  $$('g.node').forEach(el => {
    const name = $(el,'title').innerHTML;
    if (!name) return;
    const pkg = _modules[name] && _modules[name].package;
    (pkg.maintainers || []).forEach(m => el.classList.add(toTag('maintainer', m.name)));
    if (pkg.license) el.classList.add(toTag('license', pkg.license));
  });

  Inspector.showGraph(module);
  Inspector.showModule(module);
  Inspector.showPane('pane-graph');
  Inspector.open();
}

window.onhashchange = async function() {
  const target = (location.hash || 'request').replace(/.*#/, '');
  $$('svg').forEach(el => el.remove());
  await graph(target);
};

onload = function() {
  uncacheModules();

  $$('#tabs .button').forEach((button, i) => {
    button.onclick = () => Inspector.showPane(button.getAttribute('data-pane'));
    if (!i) button.onclick();
  })
  window.onhashchange();
  Inspector.init();
}

onunload = cacheModules;
