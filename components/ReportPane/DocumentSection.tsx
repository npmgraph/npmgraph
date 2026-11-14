import type { ReactNode } from 'react';
import { useHashParameters } from '../../hooks/useHashParam.ts';
import useSectionTarget, { sectionName } from '../../hooks/useSectionTarget.ts';
import { PARAM_SECTION } from '../../lib/constants.ts';
import {
  SectionBody,
  SectionSymbol,
  type SectionType,
} from '../ui/Section.tsx';
import * as styles from './DocumentSection.module.scss';

// An always-open section with a permalink, for the report-only view
export function DocumentSection({
  title,
  count,
  type,
  children,
}: {
  title: string;
  count?: number | string;
  type?: SectionType;
  children: ReactNode;
}) {
  const name = sectionName(title);
  const ref = useSectionTarget<HTMLElement>(name);
  const [parameters] = useHashParameters();
  const permalink = new URLSearchParams(parameters);
  permalink.set(PARAM_SECTION, name);

  return (
    <section ref={ref} className={styles.root}>
      <h2>
        <a
          className={styles.permalink}
          href={`#${permalink}`}
          aria-label={`Link to ${title}`}
        >
          #
        </a>
        {title}
        <SectionSymbol type={type} />
        {count !== undefined && <small>{count}</small>}
      </h2>
      <SectionBody>{children}</SectionBody>
    </section>
  );
}
