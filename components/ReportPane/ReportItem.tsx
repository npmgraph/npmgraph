import { Suspense, use, useDeferredValue, useMemo } from 'react';

import { cn } from '../../lib/dom.ts';
import { CollapsibleSection } from '../ui/Section.tsx';
import type { RenderedAnalysis } from './analyzers/Analyzer.tsx';
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
  // Reporters can be recreated on every render, `data` identifies the report
  const result = useMemo(
    (): ReturnType<typeof reporter> => reporter(data),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- See above
    [data],
  );

  // Sync reports render immediately, without suspending
  return result instanceof Promise ? (
    <AsyncReportItem promise={result} {...props} />
  ) : (
    <ReportItemContent analysis={result} {...props} />
  );
}

function AsyncReportItem({
  promise,
  ...props
}: Omit<ReportItemProps<unknown>, 'data' | 'reporter'> & {
  promise: Promise<RenderedAnalysis | undefined>;
}) {
  // Keep showing the previous report (and its open state) while the next one loads
  const deferredPromise = useDeferredValue(promise);

  return (
    <Suspense fallback={null}>
      <AwaitedReportItem promise={deferredPromise} {...props} />
    </Suspense>
  );
}

function AwaitedReportItem({
  promise,
  ...props
}: Omit<ReportItemProps<unknown>, 'data' | 'reporter'> & {
  promise: Promise<RenderedAnalysis | undefined>;
}) {
  return <ReportItemContent analysis={use(promise)} {...props} />;
}

function ReportItemContent({
  analysis,
  children,
  ...props
}: Omit<ReportItemProps<unknown>, 'data' | 'reporter'> & {
  analysis: RenderedAnalysis | undefined;
}) {
  if (!analysis) {
    return null;
  }

  const { type, summary, count, details } = analysis;

  return (
    <CollapsibleSection
      open={false}
      icon={
        SYMBOLS[type] && (
          <span className={cn(styles.symbol, styles[type])}>
            {SYMBOLS[type]}
          </span>
        )
      }
      title={summary}
      count={count}
      {...props}
    >
      {children ? <div className={styles.description}>{children}</div> : null}
      <div className={styles.details}>{details}</div>
    </CollapsibleSection>
  );
}
