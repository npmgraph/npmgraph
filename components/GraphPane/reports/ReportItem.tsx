import React, { useEffect } from 'react';

import { cn } from '../../../lib/dom.js';
import type { RenderedAnalysis } from './Analyzer.js';
import * as styles from './ReportItem.module.scss';

const SYMBOLS = {
  info: null,
  warn: '\u{26A0}',
  error: '\u{1F6AB}',
};

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
  const [analysis, setAnalysis] = React.useState<RenderedAnalysis>();

  useEffect(() => {
    if (!data) return;

    const report = reporter(data);

    if (!report) {
      // Do nothing
    } else if (report instanceof Promise) {
      //     } else if (report instanceof Promise) {
      report.then(setAnalysis).catch(error => {
        console.error('Error in reporter:', error);
      });
    } else {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setAnalysis(report);
    }
  }, [data, reporter]);

  if (!analysis) return null;

  const { type, summary, details } = analysis;

  return (
    <details className={cn(styles.root, styles[type])} {...props}>
      <summary className="bright-hover">
        <span className={styles.symbol}>{SYMBOLS[type]}</span>
        {summary}
      </summary>
      {children ? <div className={styles.description}>{children}</div> : null}
      <div className={styles.root}>{details}</div>
    </details>
  );
}
