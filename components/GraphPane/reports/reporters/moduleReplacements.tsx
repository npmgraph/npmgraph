import { all, resolveDocUrl } from 'module-replacements';
import type { ModuleReplacement } from 'module-replacements';
import { cn } from '../../../../lib/dom.ts';
import { ExternalLink } from '../../../ExternalLink.tsx';
import { Selectable } from '../../../Selectable.tsx';
import type { RenderedAnalysis } from '../Analyzer.tsx';
import type { ModuleAnalysisState } from '../analyzeModules.ts';
import * as reportItemStyles from '../ReportItem.module.scss';
import * as styles from './moduleReplacements.module.scss';

function getReplacements(moduleName: string) {
  const mapping = all.mappings[moduleName];
  if (!mapping) return { mapping: null, replacements: null };

  return {
    mapping,
    replacements: mapping.replacements.map(id => all.replacements[id]),
  };
}

function renderDetail(replacement: ModuleReplacement) {
  switch (replacement.type) {
    case 'native': {
      const url = resolveDocUrl(replacement.url)!;

      const nodeVersion = replacement.engines?.find(
        e => e.engine === 'nodejs',
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

    case 'documented': {
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
    }

    case 'simple':
      return <span>{replacement.description}</span>;

    case 'removal':
      return <span>{replacement.description}</span>;
  }
}

export function moduleReplacementsNative({
  moduleInfos,
  // entryModules,
}: ModuleAnalysisState) {
  const details = Array.from(moduleInfos.values())
    .map(({ module }) => ({
      module,
      ...getReplacements(module.name),
    }))
    .sort((a, b) => a.module.key.localeCompare(b.module.key))
    .filter(d => d.mapping != null)
    .map(({ module, mapping, replacements }) => {
      const mappingURL = resolveDocUrl(mapping.url);

      return (
        <div
          className={cn(styles.root, reportItemStyles.zebraRow)}
          key={module.key}
        >
          <Selectable value={module.key} className={styles.selectable} />
          {': '}
          <div className={styles.body}>
            {replacements.length === 1 ? (
              renderDetail(replacements[0])
            ) : (
              <ul>
                {replacements.map(r => (
                  <li key={r.id}>{renderDetail(r)}</li>
                ))}
              </ul>
            )}
          </div>
          {mappingURL && (
            <ExternalLink href={mappingURL} className={styles.body}>
              Learn more
            </ExternalLink>
          )}
        </div>
      );
    });

  if (details.length === 0) return;

  return {
    type: 'warn',
    summary: `Suggested replacements (${details.length})`,
    details,
  } as RenderedAnalysis;
}
