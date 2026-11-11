import type { ReactNode } from 'react';
import useLocation from '../../hooks/useLocation.ts';
import useSectionTarget, { sectionName } from '../../hooks/useSectionTarget.ts';
import { PARAM_SECTION } from '../../lib/constants.ts';
import { SectionBody } from '../ui/Section.tsx';
import * as styles from './DocumentSection.module.scss';

// An always-open section with a permalink, for the report-only view
export function DocumentSection({
  title,
  count,
  icon,
  children,
}: {
  title: string;
  count?: number | string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  const name = sectionName(title);
  const ref = useSectionTarget<HTMLElement>(name);
  const [url] = useLocation();
  const permalink = new URLSearchParams(url.hash.slice(1));
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
        {icon}
        {count !== undefined && <small>{count}</small>}
      </h2>
      <SectionBody>{children}</SectionBody>
    </section>
  );
}
