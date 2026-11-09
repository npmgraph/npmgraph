import type { ReactNode } from 'react';
import { $$optional } from 'select-dom';
import { patchLocation } from '../../hooks/useLocation.ts';
import useReportOnly from '../../hooks/useReportOnly.ts';
import { sectionName } from '../../hooks/useSectionTarget.ts';
import { PaneType, PARAM_SECTION, PARAM_TAB } from '../../lib/constants.ts';
import { cn } from '../../lib/dom.ts';
import { CollapsibleSection } from '../ui/Section.tsx';
import { DocumentSection } from './DocumentSection.tsx';
import * as styles from './ReportItem.module.css';

const SYMBOLS = { info: null, warn: '\u{26A0}', error: '\u{1F6AB}' };

// Like in the report-only view, a single open section is linkable
function storeOpenSection() {
  const [firstItem, moreThanOpenOpen] = $$optional(
    'details[data-report-item][open]',
  );
  const section = moreThanOpenOpen
    ? null
    : // Also update when closing, since the one left open may be a different section
      // eslint-disable-next-line unicorn/dom-node-dataset -- No greppability
      firstItem?.getAttribute('data-report-item');

  // The section only makes sense together with its tab
  const parameters = new URLSearchParams(location.hash.slice(1));
  parameters.set(PARAM_TAB, PaneType.REPORT);
  if (section) {
    parameters.set(PARAM_SECTION, section);
  } else {
    parameters.delete(PARAM_SECTION);
  }

  patchLocation({ hash: parameters.toString() }, true);
}

export function ReportItem({
  title,
  count,
  type = 'info',
  description,
  open = false,
  children,
}: {
  title: string;
  count?: number | string;
  type?: 'info' | 'warn' | 'error';
  description?: ReactNode;
  open?: boolean;
  children: ReactNode;
}) {
  const [isReportOnly] = useReportOnly();
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
      open={open}
      icon={icon}
      title={title}
      count={count}
      data-report-item={sectionName(title)}
      onToggle={storeOpenSection}
    >
      {body}
    </CollapsibleSection>
  );
}
