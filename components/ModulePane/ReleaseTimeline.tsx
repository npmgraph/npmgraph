import type { PackumentVersion } from '@npm/types';
import type { SemVer } from 'semver';
import { parse } from 'semver';
import type Module from '../../lib/Module.js';

import type { ReactElement } from 'react';
import { cn } from '../../lib/dom.js';
import useMeasure from '../../lib/useMeasure.js';
import { Section } from '../Section.js';
import * as styles from './ReleaseTimeline.module.scss';

function timestring(t: number) {
  return new Date(t).toISOString().replace(/T.*/, '');
}

function createScale(in0: number, in1: number, out0: number, out1: number) {
  return function (v: number) {
    if (in1 === in0) return (out1 + out0) / 2;
    return ((v - in0) / (in1 - in0)) * (out1 - out0) + out0;
  };
}

export function ReleaseTimeline({ module }: { module: Module }) {
  const [ref, { width: w, height: h }] = useMeasure<SVGSVGElement>();
  if (!module.packument?.versions) return;

  const { time, versions } = module.packument;

  const byTime = Object.entries(versions)
    .map(([key, version]) => {
      return [
        key,
        {
          ...version,
          time: Date.parse(time[key]),
          semver: parse(key),
        } as PackumentVersion & {
          time: number;
          semver: SemVer;
        },
      ] as const;
    })
    // "0.0.0" isn't a valid version (e.g. you can't npm publish it)
    .filter(([, { semver }]) => semver.version !== '0.0.0')
    .sort(([, a], [, b]) => {
      return a.time < b.time ? -1 : 0;
    });

  // No releases to display?
  if (byTime.length === 0) return;

  const majorMax = byTime.reduce(
    (acc, [, v]) => Math.max(acc, v.semver.major),
    byTime[0][1].semver.major,
  );
  const majorMin = byTime.reduce(
    (acc, [, v]) => Math.min(acc, v.semver.major),
    byTime[0][1].semver.major,
  );

  const tmin = byTime[0][1].time;
  const tmax = Date.now(); // byTime[byTime.length - 1][1].time;

  const layers = {
    // Note: order here controls layering in SVG
    grid: [] as ReactElement[],
    prerelease: [] as ReactElement[],
    patch: [] as ReactElement[],
    minor: [] as ReactElement[],
    major: [] as ReactElement[],
    text: [] as ReactElement[],
  };

  const xScale = createScale(tmin, tmax, 0, w);
  const yScale = createScale(majorMax, majorMin, 0, h);

  // Add grid lines for each year
  for (
    let year = new Date(tmin).getFullYear() + 1;
    year <= new Date(tmax).getFullYear();
    year++
  ) {
    const x = xScale(Date.parse(String(year)));
    layers.grid.push(<line x1={x} y1={0} x2={x} y2={h} key={`year-${year}`} />);
  }

  // Add version dots and lines
  for (const [key, version] of byTime) {
    const { time, semver } = version;

    if (!semver) continue;

    const x = xScale(time);
    const title = `${key} published ${timestring(time)}`;
    const y = yScale(semver.major);

    let r = 10;

    let layer: keyof typeof layers;
    if (semver.prerelease.length) {
      layer = 'prerelease';
      r *= 0.4;
    } else if (semver.patch) {
      layer = 'patch';
      r *= 0.4;
    } else if (semver.minor) {
      layer = 'minor';
      r *= 0.5;
    } else if (semver.major) {
      layer = 'major';

      // Add major-version grid line
      // layers.grid.push(
      //   <line x1={x} y1={y} x2={w} y2={y} key={`version-${version.version}`} />,
      // );
    } else {
      continue;
    }

    layers[layer].push(
      <g key={`dot=${key}`} className={styles.dot}>
        <title>{title}</title>
        <circle cx={x} cy={y} r={r} />
        {
          // Major dots get a label
          layer === 'major' ? (
            <>
              <title>{title}</title>

              <text x={x} y={y} textAnchor="middle" alignmentBaseline="central">
                {semver.major}
              </text>
            </>
          ) : null
        }
      </g>,
    );
  }

  const xpad = w * 0.1;
  const ypad = h * 0.1;
  return (
    <Section title="Release Timeline">
      <svg
        viewBox={`${-xpad} ${-ypad} ${w + xpad * 2} ${h + ypad * 2}`}
        className={styles.root}
        ref={ref}
      >
        {Object.entries(layers).map(([k, layer]) => {
          return (
            <g
              key={`layer-${k}`}
              className={styles[`layer-${k}` as keyof typeof styles] as string}
            >
              {layer}
            </g>
          );
        })}
      </svg>

      <div className={styles.xAxis}>
        <span>{timestring(tmin)}</span>
        <span>today</span>
      </div>

      <div className={styles.legend}>
        <span>
          <span className={cn(styles.dotKey, styles.dotKeyMajor)} /> = major
        </span>
        <span>
          <span className={cn(styles.dotKey, styles.dotKeyMinor)} /> = minor
        </span>
        <span>
          <span className={cn(styles.dotKey, styles.dotKeyPatch)} /> = patch
        </span>
        <span>
          <span className={cn(styles.dotKey, styles.dotKeyPrerelease)} /> =
          prerelease
        </span>
      </div>
    </Section>
  );
}
