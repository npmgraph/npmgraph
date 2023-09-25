import { Maintainer } from '@npm/types';
import React from 'react';
import { useExcludes } from '../components/App.js';
import { Pane } from '../components/Pane.js';
import { PieGraph } from '../components/PieGraph.js';
import { Section } from '../components/Section.js';
import { Tag } from '../components/Tag.js';
import { Tags } from '../components/Tags.js';
import { Toggle } from '../components/Toggle.js';
import {
  COLORIZE_BUS,
  COLORIZE_COLORS,
  COLORIZE_MAINTENANCE,
  COLORIZE_MODULE_CJS,
  COLORIZE_MODULE_ESM,
  COLORIZE_MODULE_TYPE,
  COLORIZE_NONE,
  COLORIZE_OVERALL,
  COLORIZE_POPULARITY,
  COLORIZE_QUALITY,
} from '../graphdiagram/GraphDiagram.js';
import { GraphState, hslFor } from '../graphdiagram/graph_util.js';
import simplur from '../util/simplur.js';
import useHashProp from '../util/useHashProp.js';
import '/css/GraphPane.scss';

export default function GraphPane({
  graph,
  ...props
}: { graph: GraphState | null } & React.HTMLAttributes<HTMLDivElement>) {
  const compareEntryKey = ([a]: [string, unknown], [b]: [string, unknown]) =>
    a < b ? -1 : a > b ? 1 : 0;
  const [colorize, setColorize] = useHashProp('c');
  const [excludes] = useExcludes();
  const [includeDev, setIncludeDev] = useHashProp('dev');

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
      <Toggle
        checked={Boolean(includeDev)}
        onChange={() => setIncludeDev(includeDev ? '' : '1')}
      >
        Include devDependencies
      </Toggle>

      <label id="colorize-ui">
        Colorize by:
        <select
          value={colorize ?? ''}
          onChange={e => setColorize(e.target.value)}
        >
          <option value={COLORIZE_NONE}>Nothing (uncolored)</option>
          <option value={COLORIZE_MODULE_TYPE}>Module type (ESM v. CJS)</option>

          <option value={COLORIZE_OVERALL}> npms.io overall score</option>
          <option value={COLORIZE_QUALITY}> npms.io quality score</option>
          <option value={COLORIZE_POPULARITY}> npms.io popularity score</option>
          <option value={COLORIZE_MAINTENANCE}>
            npms.io maintenance score
          </option>

          <option value={COLORIZE_BUS}># of maintainers</option>
        </select>
      </label>

      {colorize == COLORIZE_BUS ? (
        <div>
          <span style={{ fontWeight: 'bold', color: COLORIZE_COLORS[0] }}>
            {'\u2B24'}
          </span>{' '}
          = 1 maintainer,
          <span style={{ color: COLORIZE_COLORS[1] }}>{'\u2B24'}</span> = 2,
          <span style={{ color: COLORIZE_COLORS[2] }}>{'\u2B24'}</span> = 3,
          <span style={{ color: COLORIZE_COLORS[3] }}>{'\u2B24'}</span> = 4+
        </div>
      ) : colorize == COLORIZE_MODULE_TYPE ? (
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
            .map(([value, count]) => (
              <Tag
                key={value + count}
                type="name"
                value={value}
                count={count}
                className={excludes.includes(value) ? 'collapsed' : ''}
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
                type="maintainer"
                value={name}
                count={count ?? 0}
                gravatar={email}
              />
            ))}
        </Tags>
      </Section>

      <Section title={simplur`${licenses.length} License[|s]`}>
        <Tags>
          {licenses.map(([value, count]) => (
            <Tag
              key={value + count}
              type="license"
              value={value}
              count={count}
            />
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

function compareEntryValue<T = string | number>(
  [, a]: [string, T],
  [, b]: [string, T],
) {
  return a < b ? -1 : a > b ? 1 : 0;
}
