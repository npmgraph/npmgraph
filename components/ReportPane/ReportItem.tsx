import type { ReactNode } from 'react';
import useReportOnly from '../../hooks/useReportOnly.ts';
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
    <CollapsibleSection open={open} icon={icon} title={title} count={count}>
      {body}
    </CollapsibleSection>
  );
}
