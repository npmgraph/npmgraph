import {$, $$, ajax, toLicense, renderLicense, renderMaintainer, renderModule} from './util.js';
import Store from './Store.js';

export default class Inspector {
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
    const noCache = /noCache/i.test(location.search);
    history.pushState({}, null, `${location.pathname}?q=${term}${noCache ? '&noCache' : ''}`);
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
    const licenseTags = Object.entries(licenses).sort().map(e => renderLicense(...e));

    $('#pane-graph h2').innerHTML = `${depList.length} Modules`;
    $('#pane-graph .dependencies').innerHTML = Object.entries(depCount).map(e => renderModule(e[0], e[1])).sort().join('');
    $('#pane-graph .maintainers').innerHTML = maintainers.join('');
    $('#pane-graph .licenses').innerHTML = licenseTags.join('');

    // Make a chart
    var config = {
			bindto: '#chart',
			data: {
				columns: [],
				type : 'pie',
			}
		};
    config.data.columns = Object.entries(licenses)
			.sort((a,b) => a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0);
		var chart = c3.generate(config);
    $('#inspector').scrollTo(0, 0);
  }

  static async setModule(module) {
    const pkg = module.package || module;

    $('#pane-module h2').innerHTML = `<a href="?q=${module.key}">${module.key}</a> Info`;
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
