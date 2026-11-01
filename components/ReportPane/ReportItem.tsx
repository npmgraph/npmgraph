import { Suspense, use, useDeferredValue, type ReactElement } from 'react';
import useReportOnly from '../../hooks/useReportOnly.ts';

import { cn } from '../../lib/dom.ts';
import { CollapsibleSection } from '../ui/Section.tsx';
import { DocumentSection } from './DocumentSection.tsx';
import * as styles from './ReportItem.module.scss';

export type RenderedAnalysis = {
  type: 'info' | 'warn' | 'error';
  summary: string;
  count?: number | string;
  details: ReactElement[];
};

const SYMBOLS = { info: null, warn: '\u{26A0}', error: '\u{1F6AB}' };

export type Report =
  RenderedAnalysis | undefined | Promise<RenderedAnalysis | undefined>;

type ReportItemProps = {
  report: Report;
  type?: 'info' | 'warn' | 'error';
} & React.HTMLAttributes<HTMLDetailsElement>;

export function ReportItem({ report, ...props }: ReportItemProps) {
  // Keep showing the previous report (and its open state) while the next one loads
  const deferredReport = useDeferredValue(report);

  return (
    <Suspense fallback={null}>
      <ReportItemContent report={deferredReport} {...props} />
    </Suspense>
  );
}

function ReportItemContent({ report, children, ...props }: ReportItemProps) {
  const analysis = report instanceof Promise ? use(report) : report;
  const [isReportOnly] = useReportOnly();

  if (!analysis) {
    return null;
  }

  const { type, summary, count, details } = analysis;
  const icon = SYMBOLS[type] && (
    <span className={cn(styles.symbol, styles[type])}>{SYMBOLS[type]}</span>
  );
  const body = (
    <>
      {children ? <div className={styles.description}>{children}</div> : null}
      <div className={styles.details}>{details}</div>
    </>
  );

  return isReportOnly ? (
    <DocumentSection title={summary} count={count} icon={icon}>
      {body}
    </DocumentSection>
  ) : (
    <CollapsibleSection
      open={false}
      icon={icon}
      title={summary}
      count={count}
      {...props}
    >
      {body}
    </CollapsibleSection>
  );
}
