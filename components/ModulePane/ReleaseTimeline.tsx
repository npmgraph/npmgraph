import { PackumentVersion } from '@npm/types';
import Module from '../../lib/Module.js';

import { SemVer } from 'semver';
import semverParse from 'semver/functions/parse.js';
import { cn } from '../../lib/dom.js';
import useMeasure from '../../lib/useMeasure.js';
import { Section } from '../Section.js';
import styles from './ReleaseTimeline.module.scss';

function timestring(t: number) {
  return new Date(t).toISOString().replace(/T.*/, '');
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
          semver: semverParse(key),
        } as PackumentVersion & {
          time: number;
          semver: SemVer;
        },
      ] as const;
    })
    .filter(([k]) => k !== 'createdconso' && k !== 'modified')
    .sort(([, a], [, b]) => {
      return a.time < b.time ? -1 : 0;
    });

  const majorMax = byTime.reduce((acc, [, v]) => v.semver.major, 0);
  const majorSep = h / majorMax;
  const vmax = majorMax * majorSep;

  const tmin = byTime[0][1].time;
  const tmax = Date.now(); // byTime[byTime.length - 1][1].time;

  const layers = {
    // Note: order here controls layering in SVG
    grid: [] as JSX.Element[],
    prerelease: [] as JSX.Element[],
    patch: [] as JSX.Element[],
    minor: [] as JSX.Element[],
    major: [] as JSX.Element[],
    text: [] as JSX.Element[],
  };

  function xForT(t: number) {
    return ((t - tmin) / (tmax - tmin)) * w;
  }

  // Add grid lines for each year
  for (
    let year = new Date(tmin).getFullYear() + 1;
    year <= new Date(tmax).getFullYear();
    year++
  ) {
    const x = xForT(new Date(String(year)).getTime());
    layers.grid.push(<line x1={x} y1={0} x2={x} y2={h} key={`year-${year}`} />);
  }

  // Add version dots and lines
  for (const [key, version] of byTime) {
    const { time, semver } = version;

    if (!semver) continue;

    const x = xForT(time);
    const title = `${key} published ${timestring(time)}`;
    const y = vmax - semver.major * majorSep;

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
      r *= 0.4;
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
      <g key={`dot=${key}`} className="dot">
        <title>{title}</title>
        <circle cx={x} cy={y} r={r} />
        {
          // Major dots get a label
          layer === 'major' ? (
            <>
              <title>{title}</title>

              <text
                x={x}
                y={y}
                textAnchor="middle"
                alignmentBaseline="middle"
                fill="white"
              >
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
          return <g className={styles[`layer-${k}`]}>{layer}</g>;
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
