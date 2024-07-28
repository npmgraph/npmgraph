import { quantize } from 'd3-interpolate';
import { scaleOrdinal } from 'd3-scale';
import { interpolateSpectral } from 'd3-scale-chromatic';
import { select } from 'd3-selection';
import type { PieArcDatum } from 'd3-shape';
import { arc, pie } from 'd3-shape';
import type { HTMLProps } from 'react';
import React, { useEffect, useRef } from 'react';

type PieDatum = [string, number];

export function PieGraph({
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
    const w2 = width / 2;
    const h2 = height / 2;
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
