import { Suspense, use, useDeferredValue } from 'react';
import usePromise from '../../hooks/usePromise.ts';
import useReportOnly from '../../hooks/useReportOnly.ts';

import { cn } from '../../lib/dom.ts';
import { CollapsibleSection } from '../ui/Section.tsx';
import type { RenderedAnalysis } from './analyzers/Analyzer.tsx';
import { DocumentSection } from './DocumentSection.tsx';
import * as styles from './ReportItem.module.scss';

const SYMBOLS = { info: null, warn: '\u{26A0}', error: '\u{1F6AB}' };

type ReportItemProps<T> = {
  data?: T;
  reporter: (
    state: T,
  ) => Promise<RenderedAnalysis | undefined> | RenderedAnalysis | undefined;
  type?: 'info' | 'warn' | 'error';
} & React.HTMLAttributes<HTMLDetailsElement>;

export function ReportItem<T>({ data, ...props }: ReportItemProps<T>) {
  // There's nothing to report until there's data
  return data ? <LoadedReportItem data={data} {...props} /> : null;
}

function LoadedReportItem<T>({
  data,
  reporter,
  ...props
}: ReportItemProps<T> & { data: T }) {
  const promise = usePromise(data, async () => reporter(data));

  // Keep showing the previous report (and its open state) while the next one loads
  const deferredPromise = useDeferredValue(promise);

  return (
    <Suspense fallback={null}>
      <ReportItemContent promise={deferredPromise} {...props} />
    </Suspense>
  );
}

function ReportItemContent({
  promise,
  children,
  ...props
}: Omit<ReportItemProps<unknown>, 'data' | 'reporter'> & {
  promise: Promise<RenderedAnalysis | undefined>;
}) {
  const analysis = use(promise);
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
