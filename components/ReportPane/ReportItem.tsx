import { Suspense, use, useDeferredValue } from 'react';
import usePromise from '../../hooks/usePromise.ts';

import { cn } from '../../lib/dom.ts';
import { CollapsibleSection } from '../ui/Section.tsx';
import type { RenderedAnalysis } from './analyzers/Analyzer.tsx';
import * as styles from './ReportItem.module.scss';

const SYMBOLS = { info: null, warn: '\u{26A0}', error: '\u{1F6AB}' };

type ReportItemProps<T> = {
  data?: T | undefined;
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

  if (!analysis) {
    return null;
  }

  const { type, summary, count, details } = analysis;

  return (
    <CollapsibleSection
      {...props}
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
    >
      {children ? <div className={styles.description}>{children}</div> : null}
      <div className={styles.details}>{details}</div>
    </CollapsibleSection>
  );
}
