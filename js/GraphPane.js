import { c3 } from '/vendor/shims.js';
import { html, useState, useContext, useEffect } from '/vendor/preact.js';
import { AppContext } from './App.js';
import { Pane, Section, Fix, Tags, Tag } from './Inspector.js';
import { $, simplur } from './util.js';
import Toggle from './Toggle.js';

function DepInclude({ type, ...props }) {
  const { depIncludes: [depIncludes, setDepIncludes] } = useContext(AppContext);

  let arrow = null;
  switch (type) {
    case 'devDependencies': arrow = html`(<span style="color: red">${'\u{27f6}'}</span>)`; break;
    case 'peerDependencies': arrow = html`(<span style="color: green">${'\u{27f6}'}</span>)`; break;
  }

  function toggle(checked) {
    setDepIncludes(checked ? [type, ...depIncludes] : depIncludes.filter(t => type != t));
  }

  return html`
    <label class="depInclude">
      <${Toggle} style=${{ marginRight: '1em' }} checked=${depIncludes.includes(type)} onChange=${toggle} />
      <code>${type} ${arrow}</code>
    </label>
  `;
}

export default function GraphPane({ graph }) {
  const compareEntryKey = ([a], [b]) => a < b ? -1 : a > b ? 1 : 0;
  const compareEntryValue = ([, a], [, b]) => a < b ? -1 : a > b ? 1 : 0;
  const { colorize: [colorize, setColorize] } = useContext(AppContext);

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
      c3.generate(config);
    } else {
      $('#chart').innerHTML = '';
    }
  });

  const x = html`
    <${Pane}>
        Include:
        <${DepInclude} type="dependencies" />
        <${DepInclude} type="devDependencies" />
        <${DepInclude} type="peerDependencies" />

        <label style="display:block; margin: 1em 0">
          <${Toggle} style=${{ marginRight: '1em' }} checked=${colorize} onChange=${(v) => setColorize(v)} />
          Colorize by npms.io score
        </label>
    
        <${Tag} title='Modules with <= 1 maintainer' name='bus' />

      <${Section} title=${simplur`${graph.size} Module[|s]`}>
        <${Tags}>
          ${
            Object.entries(dependencies)
              .sort(compareEntryKey)
              .map(([name, count]) => html`<${Tag} name=${name} type='module' count=${count} />`)
          }
        <//>
      <//>

      <${Section} title=${simplur`${Object.entries(maintainers).length} Maintainer[|s]`}>
        <${Tags}>
          ${
            Object.entries(maintainers)
            .sort(compareEntryKey)
            .map(([, { name, email, count }]) => html`<${Tag} name=${name} type='maintainer' count=${count} gravatar=${email} />`)
          }
        <//>
      <//>

      <${Section} title=${simplur`${Object.entries(licenses).length} License[|s]`}>
        <${Tags}>
          ${
            Object.entries(licenses)
            .sort(compareEntryValue)
            .reverse()
            .map(([name, count]) => html`<${Tag} name=${name} type='license' count=${count} />`)
          }
        <//>
        <div id="chart" />
      <//>

    </${Pane}>`;

  return x;
}