import { quantize } from 'd3-interpolate';
import { scaleOrdinal } from 'd3-scale';
import { interpolateSpectral } from 'd3-scale-chromatic';
import { select } from 'd3-selection';
import { PieArcDatum, arc, pie } from 'd3-shape';
import React, { HTMLProps, useEffect, useRef } from 'react';
import { useColorize, useExcludes, useIncludeDev } from './App.js';
import { Toggle } from './components/Toggle.js';
import { COLORIZE_MODULE_CJS, COLORIZE_MODULE_ESM, hslFor } from './Graph.js';
import { Tag } from './components/Tag.js';
import { Tags } from './components/Tags.js';
import { Pane } from './components/Pane.js';
import { Section } from './components/Section.js';
import { GraphState } from './types.js';
import { simplur } from './util.js';
import '/css/GraphPane.scss';
import { Maintainer } from '@npm/types';

function compareEntryValue<T = string | number>(
  [, a]: [string, T],
  [, b]: [string, T],
) {
  return a < b ? -1 : a > b ? 1 : 0;
}

type PieDatum = [string, number];

function PieGraph({
  entries,
  ...props
}: { entries: PieDatum[] } & HTMLProps<SVGSVGElement>) {
  const svgEl = useRef<SVGSVGElement>(null);
  useEffect(() => {
    // Chart code from https://observablehq.com/@d3/pie-chart

    const svgElement = svgEl.current;
    if (!svgElement) return;

    const svg = select(svgElement);
    const svgNode = svg.node();
    if (!svgNode) return;

    // Align SVG view box to actual element dimensions
    const { width, height } = svgNode.getBoundingClientRect();
    const w2 = width / 2,
      h2 = height / 2;
    const radius = Math.min(w2, h2);
    svg.attr('viewBox', `${-w2} ${-h2} ${width} ${height}`);

    // Create arcs
    const arcs = pie<PieDatum>()
      .value(e => e[1])
      .sort(null)(entries);

    // Create colors
    const color = scaleOrdinal<string>()
      .domain(entries.map(e => e[0]))
      .range(
        quantize(
          t => interpolateSpectral(t * 0.8 + 0.1),
          entries.length,
        ).reverse(),
      );

    // Render arcs
    svg
      .append('g')
      .attr('stroke', 'white')
      .selectAll('path')
      .data(arcs)
      .join('path')
      .attr('fill', e => color(e.data[0]))
      .attr(
        'd',
        arc<PieArcDatum<PieDatum>>()
          .innerRadius(radius / 2)
          .outerRadius(radius),
      )
      .append('title')
      .text(d => `${d.data[0]}: ${d.data[1].toLocaleString()}`);

    // Render labels
    const arcLabel = arc<PieArcDatum<PieDatum>>()
      .innerRadius(radius * 0.8)
      .outerRadius(radius * 0.8);
    svg
      .append('g')
      .attr('font-family', 'sans-serif')
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .selectAll('text')
      .data(arcs)
      .join('text')
      .attr('transform', d => `translate(${arcLabel.centroid(d)})`)
      .attr(
        'font-size',
        d => `${0.75 + (d.endAngle - d.startAngle) / Math.PI / 2}em`,
      )
      .call(text =>
        text
          .append('tspan')
          .attr('y', '-0.4em')
          .text(d => d.data[0]),
      )
      .call(text =>
        text
          .filter(d => d.endAngle - d.startAngle > 0.25)
          .append('tspan')
          .attr('x', 0)
          .attr('y', '0.7em')
          .attr('fill-opacity', 0.5)
          .text(d => d.data[1].toLocaleString()),
      );
  });

  return <svg ref={svgEl} {...props} />;
}

export default function GraphPane({
  graph,
  ...props
}: { graph: GraphState | null } & React.HTMLAttributes<HTMLDivElement>) {
  const compareEntryKey = ([a]: [string, unknown], [b]: [string, unknown]) =>
    a < b ? -1 : a > b ? 1 : 0;
  const [colorize, setColorize] = useColorize();
  const [excludes] = useExcludes();
  const [includeDev, setIncludeDev] = useIncludeDev();

  if (!graph?.modules) return <div>Loading</div>;

  const occurances: { [key: string]: number } = {};
  const maintainers: {
    [key: string]: Exclude<Maintainer, string> & { count?: number };
  } = {};
  const licenseCounts: { [key: string]: number } = {};

  for (const { module } of graph.modules.values()) {
    const { package: pkg, licenseString: license } = module;
    // Tally module occurances
    occurances[pkg.name] = (occurances[pkg.name] || 0) + 1;

    // Tally maintainers
    for (const { name, email } of module.maintainers) {
      if (!name) continue;
      const maints = name && maintainers[name];

      if (!maints) {
        maintainers[name] = { name, email, count: 1 };
      } else {
        maints.count = (maints.count ?? 0) + 1;
      }
    }

    // Tally licenses
    if (license) {
      licenseCounts[license] = (licenseCounts[license] || 0) + 1;
    }
  }

  const licenses = Object.entries(licenseCounts)
    .sort(compareEntryValue)
    .reverse();

  return (
    <Pane {...props}>
      <Toggle checked={includeDev} onChange={() => setIncludeDev(!includeDev)}>
        Include <code>devDependencies</code> (
        <span style={{ color: 'red' }}>{'\u{27f6}'}</span>)
      </Toggle>

      <label>
        Colorize by:
        <select
          value={colorize ?? ''}
          onChange={e => setColorize(e.target.value)}
        >
          <option value="">Nothing (uncolored)</option>
          <option value="moduleType">Module type (ESM v. CJS)</option>

          <option value="overall"> npms.io overall score</option>
          <option value="quality"> npms.io quality score</option>
          <option value="popularity"> npms.io popularity score</option>
          <option value="maintenance">npms.io maintenance score</option>

          <option value="bus"># of maintainers</option>
        </select>
      </label>

      {colorize == 'bus' ? (
        <div>
          <span style={{ color: hslFor(0) }}>{'\u2B24'}</span> = 1 maintainer,
          <span style={{ color: hslFor(1 / 3) }}>{'\u2B24'}</span> = 2,
          <span style={{ color: hslFor(2 / 3) }}>{'\u2B24'}</span> = 3,
          <span style={{ color: hslFor(3 / 3) }}>{'\u2B24'}</span> = 4+
        </div>
      ) : colorize == 'moduleType' ? (
        <div>
          <span style={{ color: COLORIZE_MODULE_CJS }}>{'\u2B24'}</span> = CJS,
          <span style={{ color: COLORIZE_MODULE_ESM }}>{'\u2B24'}</span> = ESM,
        </div>
      ) : colorize ? (
        <div>
          <span style={{ color: hslFor(0) }}>{'\u2B24'}</span> = 0%,
          <span style={{ color: hslFor(1 / 2) }}>{'\u2B24'}</span> = 50%,
          <span style={{ color: hslFor(2 / 2) }}>{'\u2B24'}</span> = 100%
        </div>
      ) : null}

      <Section title={simplur`${graph.modules.size} Module[|s]`}>
        <Tags>
          {Object.entries(occurances)
            .sort(compareEntryKey)
            .map(([name, count]) => (
              <Tag
                key={name + count}
                name={name}
                type="module"
                count={count}
                className={excludes.includes(name) ? 'collapsed' : ''}
              />
            ))}
        </Tags>

        <div
          style={{
            fontSize: '90%',
            color: 'var(--text-dim)',
            marginTop: '1em',
          }}
        >
          (Shift-click modules in graph to expand/collapse)
        </div>
      </Section>

      <Section
        title={simplur`${Object.entries(maintainers).length} Maintainer[|s]`}
      >
        <Tags>
          {Object.entries(maintainers)
            .sort(compareEntryKey)
            .map(([, { name = 'Unknown', email, count }]) => (
              <Tag
                key={name + count}
                name={name}
                type="maintainer"
                count={count ?? 0}
                gravatar={email}
              />
            ))}
        </Tags>
      </Section>

      <Section title={simplur`${licenses.length} License[|s]`}>
        <Tags>
          {licenses.map(([name, count]) => (
            <Tag key={name + count} name={name} type="license" count={count} />
          ))}
        </Tags>

        {licenses.length > 1 ? (
          <PieGraph
            style={{ width: '100%', height: '200px', padding: '1em 0' }}
            entries={licenses}
          />
        ) : null}
      </Section>
    </Pane>
  );
}
