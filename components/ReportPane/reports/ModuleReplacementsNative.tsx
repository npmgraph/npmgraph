import { resolveDocUrl, type ModuleReplacement } from 'module-replacements';
import { ExternalLink } from '../../ui/ExternalLink.tsx';
import { Selectable } from '../../ui/Selectable.tsx';
import type Module from '../../../lib/Module.ts';
import { useModuleAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';
import * as styles from './ModuleList.module.css';
import { getReplacements, type Mapping } from './replacements.ts';

// Render `backticked` parts as code
function InlineCode({ text }: { text: string }) {
  return text
    .split(/`(?<code>[^`]+)`/v)
    .map((part, index) =>
      index % 2 === 0 ? part : <code key={part}>{part}</code>,
    );
}

export function Replacement({
  replacement,
}: {
  replacement: ModuleReplacement;
}) {
  switch (replacement.type) {
    case 'native': {
      const url = resolveDocUrl(replacement.url)!;

      const nodeVersion = replacement.engines?.find(
        engine => engine.engine === 'nodejs',
      )?.minVersion;

      return (
        <>
          {replacement.description ? (
            <>
              <InlineCode text={replacement.description} />{' '}
              <ExternalLink href={url}>
                {typeof replacement.url === 'string'
                  ? 'link'
                  : replacement.url.type}
              </ExternalLink>
            </>
          ) : (
            <ExternalLink href={url}>
              <code>{replacement.id}</code>
            </ExternalLink>
          )}
          {nodeVersion && ` Node ${nodeVersion}+`}
        </>
      );
    }

    case 'documented':
      return (
        <ExternalLink
          href={`https://www.npmjs.com/package/${replacement.replacementModule}`}
        >
          {replacement.replacementModule}
        </ExternalLink>
      );

    case 'simple':
    case 'removal':
      return <InlineCode text={replacement.description} />;
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
    <div>
      <dt>
        <Selectable value={module.key} label={module.label} />
        {mappingURL && (
          <>
            {' • '}
            <ExternalLink href={mappingURL}>learn more</ExternalLink>
          </>
        )}
      </dt>
      <dd className={styles.details}>
        <ul>
          {replacements.map(r => (
            <li key={r!.id}>
              <Replacement replacement={r!} />
            </li>
          ))}
        </ul>
      </dd>
    </div>
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
          Modules that can be removed or replaced, from{' '}
          <ExternalLink href="https://github.com/e18e/module-replacements">
            module-replacements
          </ExternalLink>
        </>
      }
    >
      <dl className={styles.list}>
        {rows.map(({ module, mapping, replacements }) => (
          <ReplacementRow
            key={module.key}
            module={module}
            mapping={mapping}
            replacements={replacements}
          />
        ))}
      </dl>
    </ReportItem>
  );
}
