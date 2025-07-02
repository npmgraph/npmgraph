import type { ModuleReplacement } from 'module-replacements';
import microUtilities from 'module-replacements/manifests/micro-utilities.json' with { type: 'json' };
import native from 'module-replacements/manifests/native.json' with { type: 'json' };
import preferred from 'module-replacements/manifests/preferred.json' with { type: 'json' };
import { cn } from '../../../../lib/dom.js';
import { ExternalLink } from '../../../ExternalLink.js';
import { Selectable } from '../../../Selectable.js';
import type { RenderedAnalysis } from '../Analyzer.js';
import type { ModuleAnalysisState } from '../analyzeModules.js';
import * as styles from './moduleReplacements.module.scss';

const REPLACEMENTS = new Map<string, ModuleReplacement>();
for (const { moduleReplacements } of [native, microUtilities, preferred]) {
  for (const replacement of moduleReplacements) {
    if (REPLACEMENTS.has(replacement.moduleName)) {
      console.warn(
        'DUPLICATE REPLACEMENT',
        replacement.moduleName,
        replacement,
      );
    } else {
      REPLACEMENTS.set(
        replacement.moduleName,
        replacement as ModuleReplacement,
      );
    }
  }
}

for (const r of REPLACEMENTS.values()) {
  console.log(r.category, r.type);
}

export function moduleReplacementsNative({
  moduleInfos,
  // entryModules,
}: ModuleAnalysisState) {
  const replacements = new Array<ModuleReplacement>();
  for (const [_, info] of moduleInfos) {
    const replacement = REPLACEMENTS.get(info.module.name);
    if (replacement) {
      replacements.push(replacement);
    }
  }

  const details = Array.from(moduleInfos.values())
    .filter(info => REPLACEMENTS.has(info.module.name))
    .sort((a, b) => a.module.key.localeCompare(b.module.key))
    .map(({ module }) => {
      const r = REPLACEMENTS.get(module.name);
      let detail;

      switch (r?.type) {
        case 'native':
          detail = (
            <>
              Use native{' '}
              <ExternalLink
                href={`https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/${r.mdnPath}`}
              >
                {r.replacement}
              </ExternalLink>
            </>
          );
          break;

        case 'simple':
          detail = <>{r.replacement}</>;
          break;

        case 'documented':
          detail = (
            <>
              See{' '}
              <ExternalLink
                href={`https://github.com/es-tooling/module-replacements/tree/main/docs/modules/${r.docPath}.md`}
              >
                {r.moduleName} notes
              </ExternalLink>
            </>
          );
      }

      return (
        <div className={cn(styles.root, 'zebra-row')} key={module.key}>
          <Selectable type="exact" value={module.key} />
          {': '}
          <span className={styles.body}>{detail}</span>
        </div>
      );
    });

  if (replacements.length === 0) return;

  return {
    type: 'warn',
    summary: `Suggested replacements (${replacements.length})`,
    details,
  } as RenderedAnalysis;
}
