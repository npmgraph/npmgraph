import {
  all,
  resolveDocUrl,
  type ModuleReplacement,
} from 'module-replacements';
import { ExternalLink } from '../../ui/ExternalLink.tsx';
import { Row, RowNote, Rows } from '../../ui/Row.tsx';
import { Selectable } from '../../ui/Selectable.tsx';
import type Module from '../../../lib/Module.ts';
import { useModuleAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';

type Mapping = (typeof all.mappings)[string];

function getReplacements(moduleName: string) {
  const mapping = all.mappings[moduleName];
  if (!mapping) {
    return { mapping: null, replacements: null };
  }

  return {
    mapping,
    replacements: mapping.replacements.map(id => all.replacements[id]),
  };
}

function Replacement({ replacement }: { replacement: ModuleReplacement }) {
  switch (replacement.type) {
    case 'native': {
      const url = resolveDocUrl(replacement.url)!;

      const nodeVersion = replacement.engines?.find(
        engine => engine.engine === 'nodejs',
      )?.minVersion;

      return (
        <>
          <span>
            Replaceable with{' '}
            <code>{replacement.description ?? replacement.id}</code>{' '}
            {nodeVersion && `available since Node ${nodeVersion} `}
          </span>
          <ExternalLink href={url}>
            {typeof replacement.url === 'string'
              ? 'Open link'
              : `Open on ${replacement.url.type}`}
          </ExternalLink>
        </>
      );
    }

    case 'documented':
      return (
        <span>
          Replaceable with{' '}
          <ExternalLink
            href={`https://www.npmjs.com/package/${replacement.replacementModule}`}
          >
            {replacement.replacementModule}
          </ExternalLink>
        </span>
      );

    case 'simple':
      return <span>{replacement.description}</span>;

    case 'removal':
      return <span>{replacement.description}</span>;
  }
}

function ReplacementRow({
  module,
  mapping,
  replacements,
}: {
  module: Module;
  mapping: Mapping;
  replacements: Array<ModuleReplacement | undefined>;
}) {
  const mappingURL = resolveDocUrl(mapping.url);

  return (
    <Row>
      <Selectable value={module.key} label={module.label} />
      <RowNote>
        {replacements.length === 1 ? (
          <Replacement replacement={replacements[0]!} />
        ) : (
          <ul>
            {replacements.map(r => (
              <li key={r!.id}>
                <Replacement replacement={r!} />
              </li>
            ))}
          </ul>
        )}
      </RowNote>
      {mappingURL && <ExternalLink href={mappingURL}>Learn more</ExternalLink>}
    </Row>
  );
}

export default function ModuleReplacementsNative() {
  const { moduleInfos } = useModuleAnalysis();
  const rows = [...moduleInfos.values()]
    .map(({ module }) => ({ module, ...getReplacements(module.name) }))
    .toSorted((a, b) => a.module.key.localeCompare(b.module.key))
    .filter(row => row.mapping !== null && row.mapping !== undefined);

  if (rows.length === 0) {
    return null;
  }

  return (
    <ReportItem
      type="warn"
      title="Suggested replacements"
      count={rows.length}
      description={
        <>
          From the{' '}
          <ExternalLink href="https://github.com/e18e/module-replacements">
            module-replacements
          </ExternalLink>{' '}
          project, these modules can be removed or replaced with more modern,
          streamlined alternatives
        </>
      }
    >
      <Rows>
        {rows.map(({ module, mapping, replacements }) => (
          <ReplacementRow
            key={module.key}
            module={module}
            mapping={mapping}
            replacements={replacements}
          />
        ))}
      </Rows>
    </ReportItem>
  );
}
