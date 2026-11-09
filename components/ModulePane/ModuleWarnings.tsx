import { resolveDocUrl } from 'module-replacements';
import { isDefined } from '../../lib/guards.ts';
import type Module from '../../lib/Module.ts';
import * as listStyles from '../ReportPane/reports/ModuleList.module.css';
import { Replacement } from '../ReportPane/reports/ModuleReplacementsNative.tsx';
import { getReplacements } from '../ReportPane/reports/replacements.ts';
import { ExternalLink } from '../ui/ExternalLink.tsx';
import { Section } from '../ui/Section.tsx';
import { isOutdated } from './module-status.ts';
import { ModuleOutdated } from './ModuleVersionInfo.tsx';

export function ModuleWarnings({
  module,
  showOutdated,
}: {
  module: Module;
  showOutdated: boolean;
}) {
  const { deprecated } = module.package;
  const hasOutdated = showOutdated && isOutdated(module);
  const { mapping, replacements } = getReplacements(module.name);
  const count = [deprecated, hasOutdated, mapping].filter(Boolean).length;
  if (count === 0) {
    return null;
  }

  const mappingUrl = mapping && resolveDocUrl(mapping.url);

  return (
    <Section title="Warnings" count={count} type="warn">
      <dl className={listStyles.list}>
        {deprecated ? (
          <div>
            <dt>Deprecated</dt>
            <dd className={listStyles.details}>{deprecated}</dd>
          </div>
        ) : null}
        {hasOutdated && <ModuleOutdated module={module} />}
        {replacements ? (
          <div>
            <dt>
              Replaceable
              {mappingUrl && (
                <>
                  {' • '}
                  <ExternalLink href={mappingUrl}>learn more</ExternalLink>
                </>
              )}
            </dt>
            <dd className={listStyles.details}>
              <ul>
                {replacements.filter(isDefined).map(replacement => (
                  <li key={replacement.id}>
                    <Replacement replacement={replacement} />
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
      </dl>
    </Section>
  );
}
