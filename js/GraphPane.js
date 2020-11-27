import { d3 } from '/vendor/shims.js';
import { html, useContext, useEffect, useRef } from '/vendor/preact.js';
import { AppContext } from './App.js';
import { Pane, Section, Tags, Tag } from './Inspector.js';
import { simplur } from './util.js';
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

function PieGraph({ entries, ...props }) {
  const svgEl = useRef();
  useEffect(() => {
    // Chart code from https://observablehq.com/@d3/pie-chart

    const svg = d3.select(svgEl.current);

    // Align SVG view box to actual element dimensions
    const { width, height } = svg.node().getBoundingClientRect();
    const w2 = width / 2, h2 = height / 2;
    const radius = Math.min(w2, h2);
    svg.attr('viewBox', `${-w2} ${-h2} ${width} ${height}`);

    // Create arcs
    const arcs = d3.pie()
      .value(e => e[1])
      .sort(null)(entries);

    // Create colors
    const color = d3.scaleOrdinal()
      .domain(entries.map(e => e[0]))
      .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), entries.length).reverse());

    // Render arcs
    svg.append('g')
      .attr('stroke', 'white')
      .selectAll('path')
      .data(arcs)
      .join('path')
      .attr('fill', e => color(e.data[0]))
      .attr('d',
        d3.arc()
          .innerRadius(radius / 2)
          .outerRadius(radius)
      )
      .append('title')
      .text(d => `${d.data[0]}: ${d.data[1].toLocaleString()}`)
    ;

    // Render labels
    const arcLabel = d3.arc().innerRadius(radius * 0.8).outerRadius(radius * 0.8);
    svg.append('g')
      .attr('font-family', 'sans-serif')
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .selectAll('text')
      .data(arcs)
      .join('text')
      .attr('transform', d => `translate(${arcLabel.centroid(d)})`)
      .attr('font-size', d => `${0.75 + (d.endAngle - d.startAngle) / Math.PI / 2}em`)
      .call(text => text.append('tspan')
        .attr('y', '-0.4em')
        .text(d => d.data[0]))
      .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append('tspan')
        .attr('x', 0)
        .attr('y', '0.7em')
        .attr('fill-opacity', 0.5)
        .text(d => d.data[1].toLocaleString()));
  });

  return html`<svg ref=${svgEl} ...${props}/>`;
}

export default function GraphPane({ graph }) {
  const compareEntryKey = ([a], [b]) => a < b ? -1 : a > b ? 1 : 0;
  const compareEntryValue = ([, a], [, b]) => a < b ? -1 : a > b ? 1 : 0;
  const { colorize: [colorize, setColorize] } = useContext(AppContext);

  const dependencies = {};
  const maintainers = {};
  let licenses = {};
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

  licenses = Object.entries(licenses)
    .sort(compareEntryValue)
    .reverse();

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

      <${Section} title=${simplur`${licenses.length} License[|s]`}>
        <${Tags}>
          ${
            licenses.map(([name, count]) => html`<${Tag} name=${name} type='license' count=${count} />`)
          }
        <//>
        
        ${licenses.length > 1 ? html`<${PieGraph} style=${{ width: '100%', height: '200px', padding: '1em 0' }} entries=${licenses} />` : null}
      <//>

    </${Pane}>`;

  return x;
}