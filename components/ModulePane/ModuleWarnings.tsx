import { Fragment } from 'react';
import { resolveDocUrl } from 'module-replacements';
import WarningIcon from '../../images/icons/warning.svg?react';
import { isDefined } from '../../lib/guards.ts';
import type Module from '../../lib/Module.ts';
import { Replacement } from '../ReportPane/reports/ModuleReplacementsNative.tsx';
import { getReplacements } from '../ReportPane/reports/replacements.ts';
import { ExternalLink } from '../ui/ExternalLink.tsx';
import { Section } from '../ui/Section.tsx';
import { isOutdated } from './module-status.ts';
import { ModuleOutdated } from './ModuleVersionInfo.tsx';
import * as styles from './ModuleWarnings.module.css';

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <p className={styles.warning}>
      <WarningIcon />
      <span>{children}</span>
    </p>
  );
}

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
    <Section title="Warnings" count={count}>
      {deprecated ? <Warning>Deprecated: {deprecated}</Warning> : null}
      {hasOutdated && <ModuleOutdated module={module} />}
      {replacements ? (
        <Warning>
          Replaceable:{' '}
          {replacements.filter(isDefined).map((replacement, index) => (
            <Fragment key={replacement.id}>
              {index > 0 && ', '}
              <Replacement replacement={replacement} />
            </Fragment>
          ))}
          {mappingUrl && (
            <>
              {' • '}
              <ExternalLink href={mappingUrl}>learn more</ExternalLink>
            </>
          )}
        </Warning>
      ) : null}
    </Section>
  );
}
