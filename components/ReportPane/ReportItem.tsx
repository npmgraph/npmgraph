import { useEffect, useState } from 'react';

import { cn } from '../../lib/dom.ts';
import { CollapsibleSection } from '../ui/Section.tsx';
import type { RenderedAnalysis } from './analyzers/Analyzer.tsx';
import * as styles from './ReportItem.module.scss';

const SYMBOLS = { info: null, warn: '\u{26A0}', error: '\u{1F6AB}' };

export function ReportItem<T>({
  data,
  reporter,
  children,
  ...props
}: {
  data?: T;
  reporter: (
    state: T,
  ) => Promise<RenderedAnalysis | undefined> | RenderedAnalysis | undefined;
  type?: 'info' | 'warn' | 'error';
} & React.HTMLAttributes<HTMLDetailsElement>) {
  const [analysis, setAnalysis] = useState<RenderedAnalysis>();

  useEffect(() => {
    if (!data) {
      return;
    }

    void Promise.resolve(reporter(data)).then(report => {
      setAnalysis(report);
    });
  }, [data, reporter]);

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
