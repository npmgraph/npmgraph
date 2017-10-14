async function fetch(path) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const loader = new LoadWidget(path);
    loader.start();
    xhr.open('GET', `http://cors-proxy.htmldriven.com/?url=https://registry.npmjs.org/${path}`);
      xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) return;
        loader.stop();
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.responseText);
        } else {
          reject(xhr.status);
        }
      }
      xhr.send();
    });
}

const _modules = {};

const _fetch = {};

class LoadWidget {
  constructor(name) {
    this.el = document.createElement('div');
    this.el.className = 'loader';
    this.el.innerText = name;
    this.el.appendChild(document.createElement('span'));
  }

  start() {
    document.body.appendChild(this.el);
  }

  stop() {
    this.el.className = 'loader done';
  }
}

class Module {
  static async get(name, version = 'latest') {
    const key = this.key(name, version);
    let module = _modules[key];
    if (module) {
      //console.log('Cached', module.key);
    } else {
      // Only fetch one version of a module at a time
      if (!_fetch[name]) _fetch[name] = Promise.resolve();
      _fetch[name] = _fetch[name].then(() => fetch(`${name}/${version}`));

      const json = await _fetch[name];
      const obj = JSON.parse(json);
      const pkg = JSON.parse(obj.body);
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

  const module = await Module.get(name);
  await render(module);

  const dotDoc = [
    'digraph {',
    'rankdir="LR"',
    '// Default styles',
    `graph [fontname="${FONT}"]`,
    `node [shape=box fontname="${FONT}" fontsize=11 height=0 width=0 margin=.04]`,
    `edge [fontsize=10, fontname="${FONT}" splines="polyline"]`,
    '\n// Puts start node at top of graph',
    ''
  ]
    .concat(nodes)
    .concat(edges)
    .concat('}')
    .join('\n');

  // Words cannot do justice to how awesome https://github.com/mdaines/viz.js/
  // is
  const dot = Viz(dotDoc, {format: 'svg'});
  const dp = new DOMParser();
  const doc = dp.parseFromString(dot, 'text/html')
  const svg = doc.querySelector('svg');
  document.body.appendChild(svg);
}

document.addEventListener('click', function(event) {
  let el = event.srcElement;
  while (el && el.nodeName != 'text') el = el.parentElement;
  if (el) {
    const module = _modules[el.innerHTML];
    if (module) {
      console.log(module);
    }
  }
});

window.onhashchange = window.onload = async function() {
  const target = (location.hash || 'request').replace(/.*#/, '');
  document.querySelectorAll('svg').forEach(el => el.remove());
  console.time('graph');
  await graph(target);
  document.querySelectorAll('.loader').forEach(el => el.remove());
  console.timeEnd('graph');
};
