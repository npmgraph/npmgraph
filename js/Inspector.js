/* global c3 */

import {$, $$, ajax, createTag, reportError, entryFromKey} from './util.js';
import Store from './Store.js';
import md5 from './md5.js';

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
    if (typeof(open) != 'boolean') open = !body.classList.contains('open');
    $('#tabs .arrow').innerHTML = open ? '&#x25ba' : '&#x25c0';
    $('body').classList.toggle('open', open);
  }

  static async setGraph(module) {
    const dependencies = {};
    const dependencyCounts = {};
    const maintainers = {};
    const maintainerCounts = {};
    const licenses = new Map();
    let nModules = 0, nMaintainers = 0;

    // Walk module dependency tree to gather up the info we care about
    function walk(m) {
      if (Array.isArray(m)) return Promise.all(m.map(walk));

      const pkg = m.package;
      const license = m.licenseString;

      if (!m || (m.key in dependencies)) return;

      dependencies[m.key] = m;
      nModules++;

      if (module.package != pkg) dependencyCounts[pkg.name] = (dependencyCounts[pkg.name] || 0) + 1;

      pkg.maintainers.forEach(maintainer => {
        if (maintainer.name in maintainers) {
          maintainerCounts[maintainer.name]++;
        } else {
          nMaintainers++;
          maintainerCounts[maintainer.name] = 1;
          maintainers[maintainer.name] = maintainer;
        }
      });

      licenses.set(license, (licenses.get(license) || 0) + 1);

      return Promise.all(Object.entries(pkg.dependencies || {})
        .map(async e => {
          const module = await Store.getModule(...e);
          return walk(module);
        }));
    }
    await walk(module);

    $('.dependencies > h2:first-of-type').childNodes[0].textContent =
      `${nModules - 1} ${nModules == 2 ? 'Dependency' : 'Dependencies'}`;
    $('.maintainers > h2:first-of-type').childNodes[0].textContent =
      `${nMaintainers} ${nMaintainers == 1 ? 'Maintainer' : 'Maintainers'}`;

    // sort comparators for Object.entries() lists
    const sortByEntryKey = (a, b) => a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0);
    // const sortByEntryValue = (a, b) => a[1] < b[1] ? -1 : (a[1] > b[1] ? 1 : 0);

    const depEl = $('#pane-graph .dependencies');
    $$(depEl, '.tag').forEach(el => el.remove());
    Object.entries(dependencyCounts)
      .sort(sortByEntryKey)
      .forEach(e => depEl.append(createTag('module', e[0], e[1])));

    const maintEl = $('#pane-graph .maintainers');
    $$(maintEl, '.tag').forEach(el => el.remove());
    Object.entries(maintainers)
      .sort(sortByEntryKey)
      .forEach(e => {
        const count = maintainerCounts[e[0]];
        const tag = createTag('maintainer', e[0], count);
        if (e[1].email) {
          const hash = md5(e[1].email).map(v => (('0' + v.toString(16)).slice(-2))).join('');
          tag.insertBefore($.parse(`<img src="https://www.gravatar.com/avatar/${hash}?s=32" />`), tag.firstChild);
        }
        maintEl.append(tag);
      });

    const licEl = $('#pane-graph .licenses');
    $$(licEl, '.tag').forEach(el => el.remove());
    Array.from(licenses)
      .sort(sortByEntryKey)
      .forEach(([license, count]) => {
        const tag = createTag('license', license || 'Unspecified', count);
        if (!license) tag.style.color = 'red';
        licEl.append(tag);
      });

    // Make a chart
    if (nModules > 1) {
      const config = {
        bindto: '#chart',
        data: {
          columns: [],
          type: 'pie',
        }
      };
      config.data.columns = Array.from(licenses)
        .sort((a, b) => a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0);
      c3.generate(config);
    } else {
      $('#chart').innerHTML = '';
    }
    $('#inspector').scrollTo(0, 0);


    // Colorize handler
    $('#colorize').checked = false;
    $('#colorize').onclick = function(event) {
      const colorize = this.checked;

      $$('svg .node path').forEach(async el => {
        if (!colorize) {
          el.style.fill = '';
          el.style.fillOpacity = '';
        } else {
          const moduleKey = el.parentNode.textContent.trim();
          const module = await Store.getModule(...entryFromKey(moduleKey));
          if (module) {
            const scores = await module.getScores();
            if (scores && scores.final !== null) {
              el.style.fill = 'red';
              el.style.fillOpacity = Math.max(0, 1 - scores.final);
            }
          }
        }
      });
    };
  }

  static async setModule(module) {
    if (Array.isArray(module)) {
      module = module.lengt == 1 ? module[0] : null;
    }

    const pkg = module && module.package;

    $('#pane-module h2').innerHTML = module ? `<a href="?q=${module.key}">${module.key}</a> Info` : '';
    $('#pane-module .description').innerHTML = pkg ? `${pkg.description}` : '';

    const pkgCopy = Object.assign({}, pkg);
    for (const k in pkgCopy) {
      if (/^_.*|gitHead|bugs|scripts|dist|directories/.test(k)) delete pkgCopy[k];
    }
    $('#pane-module .json').innerText = JSON.stringify(pkgCopy, null, 2);

    $('#inspector').scrollTo(0, 0);

    let requests;
    if (pkg) {
      $('#pane-module .stats').innerHTML = '(Getting info...)';

      try {
        requests = await Promise.all([
          ajax('GET', `https://api.npmjs.org/downloads/point/last-week/${pkg.name}`),
          module.getScores(),
        ]);
      } catch (err) {
        console.error(err);
        reportError(err);
      }
    }

    if (requests) {
      const [stats, scores] = requests;

      const final = scores ? (scores.final * 100).toFixed(0) + '%' : 'n/a';
      const quality = scores ? (scores.quality*100).toFixed(0) + '%' : 'n/a';
      const popularity = scores ? (scores.popularity*100).toFixed(0) + '%' : 'n/a';
      const maintenance = scores ? (scores.maintenance*100).toFixed(0) + '%' : 'n/a';
      const license = module.licenseString;

      // If no license, see if it's specified in the gh repo
      let repoLicense;
      let licenseWarning;

      if (!license && module.githubPath) {
        const gh = await ajax('GET', `https://api.github.com/repos/${module.githubPath}`);

        repoLicense = gh && gh.license;
        repoLicense = repoLicense && (repoLicense.spdx_id || repoLicense.name);
        licenseWarning = '<p>package.json is missing "license".  Please report this <a href="`${https://www.github.com/${module.githubPath}/issues}`">issue</a></p>'; // eslint-disable-line max-len
      }


      $('#pane-module .stats').innerHTML = `
        <table>
        <tr><th>Maintainers</th><td>${pkg.maintainers.map(u => `<span>${u.name}</span>`).join('\n')}</td></tr>
        <tr><th>License</th>${
  license ?
    `<td>
          ${license || repoLicense || 'Unspecified'}
          ${licenseWarning || ''}
          </td></tr>` :
    '<td style="font-weight: bold; color: red">Unspecified</td></tr>'
}
        <tr><th>Downloads/week</th><td>${stats.downloads}</td></tr>
        <tr><th>NPMS.io Score</th><td class="rank"><div style="width:${final}">${final}</td></tr>
        <tr style="font-size: 8pt"><th>Quality</th><td class="rank"><div style="width:${quality}">${quality}</td></tr>
        <tr style="font-size: 8pt"><th>Popularity</th><td class="rank"><div style="width:${popularity}">${popularity}</div></td></tr>
        <tr style="font-size: 8pt"><th>Maintenance</th><td class="rank"><div style="width:${maintenance}">${maintenance}</td></tr>
        </table>
        `;
    } else {
      $('#pane-module .stats').innerText = 'Module info unavailable';
    }
  }
}
