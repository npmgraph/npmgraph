import { resolveDocUrl } from 'module-replacements';
import { Suspense, use } from 'react';
import simplur from 'simplur';
import { cn } from '../../lib/dom.ts';
import { isDefined } from '../../lib/guards.ts';
import type Module from '../../lib/Module.ts';
import { fetchModuleAdvisories } from '../ReportPane/reports/advisories.ts';
import * as listStyles from '../ReportPane/reports/ModuleList.module.css';
import { Replacement } from '../ReportPane/reports/ModuleReplacementsNative.tsx';
import { getReplacements } from '../ReportPane/reports/replacements.ts';
import { ExternalLink } from '../ui/ExternalLink.tsx';
import { SectionSymbol } from '../ui/Section.tsx';
import { isOutdated } from './module-status.ts';
import { ModuleOutdated } from './ModuleVersionInfo.tsx';
import * as styles from './ModuleWarnings.module.css';

type Props = { module: Module; showOutdated: boolean };

function Warnings({
  module,
  showOutdated,
  vulnerabilities,
}: Props & { vulnerabilities: number }) {
  const { deprecated } = module.package;
  const hasOutdated = showOutdated && isOutdated(module);
  const { mapping, replacements } = getReplacements(module.name);
  if (!(
    hasOutdated ||
    vulnerabilities > 0 ||
    Boolean(deprecated) ||
    Boolean(mapping)
  )) {
    return null;
  }

  const mappingUrl = mapping && resolveDocUrl(mapping.url);

  return (
    <dl className={cn(listStyles.list, styles.list)}>
      {deprecated ? (
        <div className={styles.inline}>
          <dt>
            <SectionSymbol warn />
            Deprecated
          </dt>
          <dd className={listStyles.details}>{deprecated}</dd>
        </div>
      ) : null}
      {hasOutdated && (
        <ModuleOutdated module={module} className={styles.inline} />
      )}
      {vulnerabilities > 0 && (
        <div className={styles.inline}>
          <dt>
            <SectionSymbol warn />
            Vulnerable
          </dt>
          <dd className={listStyles.details}>
            <ExternalLink
              href={`https://github.com/advisories?query=ecosystem%3Anpm+affects%3A${encodeURIComponent(module.name)}`}
            >
              {simplur`${vulnerabilities} advisor[y|ies]`}
            </ExternalLink>
          </dd>
        </div>
      )}
      {replacements ? (
        mappingUrl ? (
          <div className={styles.inline}>
            <dt>
              <SectionSymbol warn />
              Replaceable
            </dt>
            <dd className={listStyles.details}>
              <ExternalLink href={mappingUrl}>learn more</ExternalLink>
            </dd>
          </div>
        ) : (
          <div>
            <dt>
              <SectionSymbol warn />
              Replaceable
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
        )
      ) : null}
    </dl>
  );
}

function WithVulnerabilities(props: Props) {
  const advisories = use(fetchModuleAdvisories(props.module));
  return <Warnings {...props} vulnerabilities={advisories.length} />;
}

export function ModuleWarnings(props: Props) {
  return (
    <Suspense fallback={<Warnings {...props} vulnerabilities={0} />}>
      <WithVulnerabilities {...props} />
    </Suspense>
  );
}
