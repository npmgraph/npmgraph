const $ = (...args) => document.querySelector(...args);
const $$ = (...args) => document.querySelectorAll(...args);

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

const _modules = {};

const _fetch = {};

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
      if (!_fetch[name]) _fetch[name] = Promise.resolve();
      const path = `${name.replace(/\//g, '%2F')}/${version}`;
      const loader = new Loader(path);
      _fetch[name] = _fetch[name]
        .then(() => fetch(path, loader))

      let obj, pkg;
      try {
        const json = await _fetch[name];
        obj = JSON.parse(json);
        pkg = JSON.parse(obj.body);
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
}

const renderMaintainer = entry => `<span class="maintainer">${entry[0]}(${entry[1]})</span>`;
const renderLicense = entry => `<span class="license">${entry[0]}(${entry[1]})</span>`;

class Inspector {
  static showPane(id) {
    $$('#inspector #tabs .button').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-pane') == id)
    });
    $$('#inspector .pane').forEach(pane => {
      pane.classList.toggle('open', pane.id == id);
    })
  }

  static open() {
      $('#inspector').classList.add('open');
  }

  static close() {
      $('#inspector').classList.remove('open');
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
    maintainers = Object.entries(maintainers).sort().map(renderMaintainer);
    licenses = Object.entries(licenses).sort().map(renderLicense);

    $('#pane-graph h2').innerHTML = `${depList.length} Modules`;
    $('#pane-graph .dependencies').innerText = depList.map(e => e[1]).sort().join(', ');
    $('#pane-graph .maintainers').innerHTML = maintainers.join('');
    $('#pane-graph .licenses').innerHTML = licenses.join('');
  }

  static showModule(module) {
    const pkg = module.package || module;

    $('#pane-module h2').innerHTML = `${module.key} Info`;
    $('#pane-module .maintainers').innerHTML = pkg.maintainers.map(u => `<span>${u.name}</span>`).join('\n');
    $('#pane-module .licenses').innerText = pkg.license || '<i>Unknown</i>';

    $('#pane-package h2').innerText = `${module.key} package.json`;
    $('#pane-package .json').innerText = JSON.stringify(pkg, null, 2);
  }
};

function handleGraphClick(event) {
  let el = event.srcElement;
  while (el && el.nodeName != 'text') el = el.parentElement;
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
  const module = await Module.get(name);
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
  document.body.appendChild(svg);

  Inspector.showGraph(module);
  Inspector.showModule(module);
  Inspector.showPane('pane-graph');
  Inspector.open();
}

window.onhashchange = async function() {
  const target = (location.hash || 'request').replace(/.*#/, '');
  $$('svg').forEach(el => el.remove());
  await graph(target);
  $$('.loader').forEach(el => el.remove());
};

onload = function() {
  $$('#tabs .button').forEach((button, i) => {
    button.onclick = () => Inspector.showPane(button.getAttribute('data-pane'));
    if (!i) button.onclick();
  })
  window.onhashchange();
}
