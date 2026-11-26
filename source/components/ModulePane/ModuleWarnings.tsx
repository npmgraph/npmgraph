import { resolveDocUrl } from 'module-replacements';
import { Suspense, use, type ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import simplur from 'simplur';
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

function Warning({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <dt>
        <SectionSymbol warn />
        {title}
      </dt>
      <dd className={listStyles.details}>{children}</dd>
    </div>
  );
}

function Warnings({
  module,
  showOutdated,
  vulnerabilities,
  advisoriesError,
}: Props & { vulnerabilities: number; advisoriesError?: unknown }) {
  const { deprecated } = module.package;
  const hasOutdated = showOutdated && isOutdated(module);
  const { mapping, replacements } = getReplacements(module.name);
  if (!(
    hasOutdated ||
    vulnerabilities > 0 ||
    Boolean(advisoriesError) ||
    Boolean(deprecated) ||
    Boolean(mapping)
  )) {
    return null;
  }

  const mappingUrl = mapping && resolveDocUrl(mapping.url);

  return (
    <dl className={styles.list}>
      {hasOutdated && (
        <Warning title="Outdated">
          <ModuleOutdated module={module} />
        </Warning>
      )}
      {deprecated ? (
        <Warning title="Deprecated">{deprecated}</Warning>
      ) : null}
      {vulnerabilities > 0 && (
        <Warning title="Vulnerable">
          <ExternalLink
            href={`https://github.com/advisories?query=ecosystem%3Anpm+affects%3A${encodeURIComponent(module.name)}`}
          >
            {simplur`${vulnerabilities} advisor[y|ies]`}
          </ExternalLink>
        </Warning>
      )}
      {Boolean(advisoriesError) && (
        <Warning title="Vulnerabilities">
          Could not load the security advisories:{' '}
          {advisoriesError instanceof Error
            ? advisoriesError.message
            : String(advisoriesError)}
        </Warning>
      )}
      {replacements ? (
        <Warning title="Replaceable">
          {mappingUrl ? (
            <ExternalLink href={mappingUrl}>learn more</ExternalLink>
          ) : (
            <ul>
              {replacements.filter(isDefined).map(replacement => (
                <li key={replacement.id}>
                  <Replacement replacement={replacement} />
                </li>
              ))}
            </ul>
          )}
        </Warning>
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
    <ErrorBoundary
      resetKeys={[props.module]}
      fallbackRender={({ error }) => (
        <Warnings {...props} vulnerabilities={0} advisoriesError={error} />
      )}
    >
      <Suspense fallback={<Warnings {...props} vulnerabilities={0} />}>
        <WithVulnerabilities {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}
