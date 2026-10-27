import { Suspense, use, useDeferredValue, useEffect } from 'react';
import useHashParam from '../../hooks/useHashParam.ts';
import usePromise from '../../hooks/usePromise.ts';
import { PARAM_SECTION } from '../../lib/constants.ts';

import { cn } from '../../lib/dom.ts';
import { CollapsibleSection } from '../ui/Section.tsx';
import type { RenderedAnalysis } from './analyzers/Analyzer.tsx';
import { getHeadingId, ReportLayoutContext } from './ReportLayout.ts';
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
  const layout = use(ReportLayoutContext);

  if (!analysis) {
    return null;
  }

  const { type, summary, count, details } = analysis;
  const body = (
    <>
      {children ? <div className={styles.description}>{children}</div> : null}
      <div className={styles.details}>{details}</div>
    </>
  );

  if (layout === 'document') {
    return (
      <DocumentSection
        summary={summary}
        count={count}
        icon={
          SYMBOLS[type] && (
            <span className={cn(styles.symbol, styles[type])}>
              {SYMBOLS[type]}
            </span>
          )
        }
      >
        {body}
      </DocumentSection>
    );
  }

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
      {body}
    </CollapsibleSection>
  );
}

function getSectionHref(id: string) {
  const parameters = new URLSearchParams(location.hash.replace(/^#/v, ''));
  parameters.set(PARAM_SECTION, id);
  return `#${parameters}`;
}

function DocumentSection({
  summary,
  count,
  icon,
  children,
}: {
  summary: string;
  count?: number | string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const id = getHeadingId(summary);
  const [section, setSection] = useHashParam(PARAM_SECTION);

  // Sections render asynchronously, so scroll once the linked one exists
  useEffect(() => {
    if (section === id) {
      document.getElementById(id)?.scrollIntoView();
    }
  }, [section, id]);

  return (
    <section>
      <h2 id={id}>
        <a
          href={getSectionHref(id)}
          aria-label={`Link to ${summary}`}
          onClick={event => {
            event.preventDefault();
            setSection(id);
          }}
        >
          #
        </a>
        {summary}
        {icon}
        {count !== undefined && <small>{count}</small>}
      </h2>
      {children}
    </section>
  );
}
