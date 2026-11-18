import AlertFillIcon from 'octicons-plain-react/AlertFill';
import { useState, type HTMLProps, type ReactNode } from 'react';
import { cn } from '../../lib/dom.ts';
import useSectionTarget, { sectionName } from '../../hooks/useSectionTarget.ts';
import { SectionOpenedContext } from './SectionOpenedContext.ts';
import * as styles from './Section.module.css';
import * as utilities from './utilities.module.css';

export function SectionBody({ children }: { children: ReactNode }) {
  return <div className={styles.body}>{children}</div>;
}

export function SectionSymbol({ warn }: { warn?: boolean }) {
  return warn ? <AlertFillIcon className={styles.warn} /> : null;
}

function Count({ count }: { count?: number | string }) {
  return count === undefined ? null : (
    <span className={styles.count}>{count}</span>
  );
}

export function CollapsibleSection({
  title,
  count,
  warn,
  className,
  children,
  open = true,
  onToggle,
  ...props
}: {
  title: string;
  count?: number | string;
  warn?: boolean;
  open?: boolean;
} & HTMLProps<HTMLDetailsElement>) {
  const name = sectionName(title);
  const ref = useSectionTarget<HTMLDetailsElement>(name);
  const [opened] = useState(() => {
    const deferred = Promise.withResolvers<void>();
    if (open) {
      deferred.resolve();
    }

    return deferred;
  });

  return (
    <details
      ref={ref}
      open={open}
      {...props}
      className={cn(className, styles.root)}
      onToggle={event => {
        if (event.currentTarget.open) {
          opened.resolve();
        }

        onToggle?.(event);
      }}
    >
      <summary className={utilities.brightHoverBackdrop}>
        {title}
        <Count count={count} />
        <SectionSymbol warn={warn} />
      </summary>
      <SectionOpenedContext value={opened.promise}>
        <SectionBody>{children}</SectionBody>
      </SectionOpenedContext>
    </details>
  );
}

export function Section({
  title,
  children,
  className,
  count,
  warn,
}: {
  title: string;
  children: any;
  className?: string;
  count?: number | string;
  warn?: boolean;
}) {
  const name = sectionName(title);
  const ref = useSectionTarget<HTMLDivElement>(name);

  return (
    <div ref={ref} className={cn(className, styles.root)}>
      <h3>
        {title}
        <Count count={count} />
        <SectionSymbol warn={warn} />
      </h3>
      <SectionBody>{children}</SectionBody>
    </div>
  );
}
