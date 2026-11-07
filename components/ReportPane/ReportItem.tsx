import type { ReactNode } from 'react';
import { $$optional } from 'select-dom';
import useHashParam from '../../hooks/useHashParam.ts';
import useReportOnly from '../../hooks/useReportOnly.ts';
import { sectionName } from '../../hooks/useSectionTarget.ts';
import { PARAM_SECTION } from '../../lib/constants.ts';
import { cn } from '../../lib/dom.ts';
import { CollapsibleSection } from '../ui/Section.tsx';
import { DocumentSection } from './DocumentSection.tsx';
import * as styles from './ReportItem.module.css';

const SYMBOLS = { info: null, warn: '\u{26A0}', error: '\u{1F6AB}' };

export function ReportItem({
  title,
  count,
  type = 'info',
  description,
  children,
}: {
  title: string;
  count?: number | string;
  type?: 'info' | 'warn' | 'error';
  description?: ReactNode;
  children: ReactNode;
}) {
  const [isReportOnly] = useReportOnly();
  const [, setSection] = useHashParam(PARAM_SECTION);
  const icon = SYMBOLS[type] && (
    <span className={cn(styles.symbol, styles[type])}>{SYMBOLS[type]}</span>
  );
  const body = (
    <>
      {description ? <p className={styles.description}>{description}</p> : null}
      {children}
    </>
  );

  return isReportOnly ? (
    <DocumentSection title={title} count={count} icon={icon}>
      {body}
    </DocumentSection>
  ) : (
    <CollapsibleSection
      open={false}
      icon={icon}
      title={title}
      count={count}
      data-report-item={sectionName(title)}
      onToggle={() => {
        // Like in the report-only view, a single open section is linkable
        const opened = $$optional('details[data-report-item][open]');
        setSection(
          // Also update when closing, since the one left open may be a different section
          opened.length === 1 ? opened[0]!.dataset['reportItem'] : null,
        );
      }}
    >
      {body}
    </CollapsibleSection>
  );
}
