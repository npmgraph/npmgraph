import { type SemVer, tryParse } from 'verkit';
import type Module from '../../lib/Module.ts';

import { AxisBottom } from '@visx/axis';
import { GridColumns } from '@visx/grid';
import { scaleLinear, scaleTime } from '@visx/scale';
import { type ReactElement, useState } from 'react';
import useMeasure from '../../hooks/useMeasure.ts';
import { isDefined } from '../../lib/guards.ts';
import { CollapsibleSection } from '../ui/Section.tsx';
import { ModuleDownloads } from './ModuleDownloads.tsx';
import * as styles from './ReleaseTimeline.module.scss';

function timestring(t: number) {
  return new Date(t).toISOString().replace(/T.*/v, '');
}

const MARGIN = { top: 16, right: 14, bottom: 40, left: 14 };
const LEGEND_Y_FROM_BOTTOM = 10;
const MAJOR_RADIUS = 8;
const MIN_TICK_SPACING = 48;

// Note: order here controls layering in SVG
const KINDS = ['prerelease', 'patch', 'minor', 'major'] as const;
type Kind = (typeof KINDS)[number];

const KIND_RADIUS: Record<Kind, number> = {
  prerelease: MAJOR_RADIUS * 0.4,
  patch: MAJOR_RADIUS * 0.4,
  minor: MAJOR_RADIUS * 0.5,
  major: MAJOR_RADIUS,
};

const KIND_CLASS: Record<Kind, string | undefined> = {
  prerelease: styles.layerPrerelease,
  patch: styles.layerPatch,
  minor: styles.layerMinor,
  major: styles.layerMajor,
};

type Release = {
  key: string;
  time: number;
  semver: SemVer;
};

type Scale = (v: number) => number;

/**
Until a package reaches 1.0.0, its 0.x.0 releases are the breaking ones, so
they're plotted as majors (labelled ".1", ".2", etc.)
*/
function hasOnlyZeroMajors(releases: Release[]) {
  return releases.every(r => r.semver.major === 0);
}

function level(semver: SemVer, isPreV1: boolean) {
  return isPreV1 ? semver.minor : semver.major;
}

function releaseKind(semver: SemVer, isPreV1: boolean): Kind | undefined {
  if (semver.prerelease?.length) {
    return 'prerelease';
  }

  if (semver.patch) {
    return 'patch';
  }

  if (isPreV1) {
    return semver.minor ? 'major' : undefined;
  }

  if (semver.minor) {
    return 'minor';
  }

  return semver.major ? 'major' : undefined;
}

function getReleases(packument: NonNullable<Module['packument']>) {
  const { time, versions } = packument;
  return Object.keys(versions)
    .map(key => {
      const semver = tryParse(key);
      // "0.0.0" isn't a valid version (e.g. you can't npm publish it)
      return !semver || key === '0.0.0'
        ? undefined
        : { key, semver, time: Date.parse(time[key]!) };
    })
    .filter(item => isDefined(item))
    .toSorted((a, b) => (a.time < b.time ? -1 : 0));
}

function buildLayers(
  releases: Release[],
  xScale: Scale,
  yScale: Scale,
  isPreV1: boolean,
) {
  const layers: Record<Kind, ReactElement[]> = {
    prerelease: [],
    patch: [],
    minor: [],
    major: [],
  };

  for (const { key, time, semver } of releases) {
    const kind = releaseKind(semver, isPreV1);
    if (!kind) {
      continue;
    }

    const x = xScale(time);
    const y = yScale(level(semver, isPreV1));
    const title = `${key} published ${timestring(time)}`;

    layers[kind].push(
      <g
        key={`dot=${key}`}
        className={`${styles.dot} ${isPreV1 && kind === 'major' ? styles.preV1 : ''}`}
      >
        <title>{title}</title>
        <circle cx={x} cy={y} r={KIND_RADIUS[kind]} />
        {kind === 'major' ? (
          <text x={x} y={y} textAnchor="middle" alignmentBaseline="central">
            {isPreV1 ? `•${semver.minor}` : semver.major}
          </text>
        ) : null}
      </g>,
    );
  }

  return layers;
}

function Legend({
  x,
  y,
  width,
  isPreV1,
}: {
  x: number;
  y: number;
  width: number;
  isPreV1: boolean;
}) {
  const itemWidth = width / KINDS.length;
  return (
    <g className={styles.legend}>
      {KINDS.toReversed().map((kind, i) => {
        const r = Math.min(KIND_RADIUS[kind], 7);
        const cx = x + i * itemWidth + 7;
        return (
          <g key={kind}>
            <g
              className={`${KIND_CLASS[kind]} ${isPreV1 && kind === 'major' ? styles.preV1 : ''}`}
            >
              <circle cx={cx} cy={y} r={r} />
            </g>
            <text x={cx + 11} y={y} alignmentBaseline="central">
              {isPreV1 && kind === 'major' ? '0.x.0' : kind}
            </text>
          </g>
        );
      })}
    </g>
  );
}

// Jan 1 of each year within (t0, t1), thinned so ticks don't crowd
function yearTicks(t0: number, t1: number, width: number) {
  const first = new Date(t0).getFullYear() + 1;
  const last = new Date(t1).getFullYear();
  const count = last - first + 1;
  if (count <= 0) {
    return [];
  }

  const step = Math.max(1, Math.ceil((count * MIN_TICK_SPACING) / width));
  const ticks: Date[] = [];
  for (let year = first; year <= last; year += step) {
    ticks.push(new Date(year, 0, 1));
  }

  return ticks;
}

export function ReleaseTimeline({ module }: { module: Module }) {
  const [ref, { width: w, height: h }] = useMeasure<SVGSVGElement>();
  const [tmax] = useState(() => Date.now());
  if (!module.packument?.versions) {
    return;
  }

  const releases = getReleases(module.packument);

  // No releases to display?
  if (releases.length === 0) {
    return;
  }

  const isPreV1 = hasOnlyZeroMajors(releases);
  const majors = releases.map(r => level(r.semver, isPreV1));
  const majorMax = Math.max(...majors);
  const majorMin = Math.min(...majors);
  const tmin = releases[0]!.time;

  const innerW = Math.max(0, w - MARGIN.left - MARGIN.right);
  const plotTop = MARGIN.top;
  const plotBottom = Math.max(plotTop, h - MARGIN.bottom);

  const xScale = scaleTime({
    domain: [new Date(tmin), new Date(tmax)],
    range: [MARGIN.left, MARGIN.left + innerW],
  });
  // Inset so the largest dots aren't clipped
  const yScale = scaleLinear({
    domain: [majorMin, majorMax],
    range: [plotBottom - MAJOR_RADIUS, plotTop + MAJOR_RADIUS],
  });

  const ticks = yearTicks(tmin, tmax, innerW);

  const layers = buildLayers(releases, xScale, yScale, isPreV1);

  const currentRelease = releases.find(r => r.key === module.version);
  const current = currentRelease
    ? {
        key: currentRelease.key,
        x: xScale(currentRelease.time),
        y: yScale(level(currentRelease.semver, isPreV1)),
      }
    : undefined;

  const currentX = current?.x ?? 0;
  let labelAnchor: 'start' | 'middle' | 'end' = 'middle';
  if (currentX < MARGIN.left + 36) {
    labelAnchor = 'start';
  } else if (currentX > w - MARGIN.right - 36) {
    labelAnchor = 'end';
  }

  return (
    <CollapsibleSection title="Release Timeline">
      <svg ref={ref} viewBox={`0 0 ${w} ${h}`} className={styles.root}>
        <GridColumns
          scale={xScale}
          tickValues={ticks}
          height={plotBottom - plotTop}
          top={plotTop}
          className={styles.layerGrid}
        />

        {current ? (
          <g className={styles.current}>
            <text x={current.x} y={plotTop - 4} textAnchor={labelAnchor}>
              this version
            </text>
          </g>
        ) : null}

        {KINDS.map(kind => (
          <g key={`layer-${kind}`} className={KIND_CLASS[kind]}>
            {layers[kind]}
          </g>
        ))}

        {current ? (
          <circle
            className={styles.currentRing}
            cx={current.x}
            cy={current.y}
            r={MAJOR_RADIUS + 3}
          />
        ) : null}

        <AxisBottom
          scale={xScale}
          top={plotBottom}
          tickValues={ticks}
          tickFormat={d => String((d as Date).getFullYear())}
          hideAxisLine={false}
          axisClassName={styles.axis}
          tickClassName={styles.axisTick}
          tickLength={4}
        />

        <Legend
          x={MARGIN.left}
          y={h - LEGEND_Y_FROM_BOTTOM}
          width={innerW}
          isPreV1={isPreV1}
        />
      </svg>

      <ModuleDownloads module={module} />
    </CollapsibleSection>
  );
}
