import { html, useState, useContext, useEffect } from '../vendor/preact.js';
import { AppContext } from './App.js';
import { Pane, Section, Fix, Tags, Tag } from './Inspector.js';
import { $, simplur } from './util.js';

function DepInclude({ type, ...props }) {
  const [depIncludes, setDepIncludes] = useContext(AppContext).depIncludes;

  let arrow = null;
  switch (type) {
    case 'devDependencies': arrow = html`(<span style="color: red">${'\u{27f6}'}</span>)`; break;
    case 'peerDependencies': arrow = html`(<span style="color: green">${'\u{27f6}'}</span>)`; break;
  }

  function toggle(e) {
    setDepIncludes(e.currentTarget.checked ? [type, ...depIncludes] : depIncludes.filter(t => type != t));
  }

  return html`
    <label class="depInclude">
      <input type="checkbox" checked=${depIncludes.includes(type)} onClick=${toggle}/>
      <code>${type}</code> ${arrow}
    </label>
  `;
}

export default function GraphPane({ graph }) {
  const compareEntryKey = ([a], [b]) => a < b ? -1 : a > b ? 1 : 0;
  const compareEntryValue = ([, a], [, b]) => a < b ? -1 : a > b ? 1 : 0;

  const dependencies = {};
  const maintainers = {};
  const licenses = {};
  for (const [, { module: { package: pkg, licenseString: license }, level }] of graph) {
    // Tally dependencies
    if (level > 0) {
      dependencies[pkg.name] = (dependencies[pkg.name] || 0) + 1;
    }

    // Tally maintainers
    for (const { name, email } of pkg.maintainers) {
      if (!maintainers[name]) {
        maintainers[name] = { name, email, count: 1 };
      } else {
        maintainers[name].count++;
      }
    }

    // Tally licenses
    licenses[license] = (licenses[license] || 0) + 1;
  }

  useEffect(() => {
    // Make a chart
    if (graph.size > 1) {
      const config = {
        bindto: '#chart',
        data: {
          columns: [],
          type: 'pie'
        }
      };
      config.data.columns = Object.entries(licenses)
        .sort(compareEntryValue);
      c3.generate(config); // eslint-disable-line no-undef
    } else {
      $('#chart').innerHTML = '';
    }
  });

  const x = html`
    <${Pane}>
      <${Section}>
        Include:
        <${DepInclude} type="dependencies" />
        <${DepInclude} type="devDependencies" />
        <${DepInclude} type="peerDependencies" />

        <label style="display:block"><input type="checkbox" id="colorize" /><${Fix} /> Colorize by <a href="https://github.com/npms-io/npms-analyzer" target="_blank">npms.io score</a></label>
        <label style="display:block"><input type="checkbox" id="busFactor" /><${Fix} /> Show modules with 0-1 maintainer</label>
      <//>

      <${Section} title=${simplur`${graph.size} Module[|s]`}>
        <${Tags}>
          ${
            Object.entries(dependencies)
              .map(([name, count]) => html`<${Tag} text=${name} type='module' count=${count} />`)
          }
        <//>
      <//>

      <${Section} title=${simplur`${Object.entries(maintainers).length} Maintainer[|s]`}>
        <${Tags}>
          ${
            Object.entries(maintainers)
            .sort(compareEntryKey)
            .map(([, { name, email, count }]) => html`<${Tag} text=${name} type='maintainer' count=${count} gravatar=${email} />`)
          }
        <//>
      <//>

      <${Section} title=${simplur`${Object.entries(licenses).length} License[|s]`}>
        <${Tags}>
          ${
            Object.entries(licenses)
            .sort(compareEntryValue)
            .reverse()
            .map(([name, count]) => html`<${Tag} text=${name} type='license' count=${count} />`)
          }
        <//>
        <div id="chart" />
      <//>

    </${Pane}>`;

  return x;
}