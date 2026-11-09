import { useState, type HTMLProps, type ReactNode } from 'react';
import { cn } from '../../lib/dom.ts';
import useSectionTarget, { sectionName } from '../../hooks/useSectionTarget.ts';
import { SectionOpenedContext } from './SectionOpenedContext.ts';
import * as styles from './Section.module.css';

export function SectionBody({ children }: { children: ReactNode }) {
  return <div className={styles.body}>{children}</div>;
}

const SYMBOLS = { info: null, warn: '\u{26A0}', error: '\u{1F6AB}' };

export type SectionType = keyof typeof SYMBOLS;

export function SectionSymbol({ type = 'info' }: { type?: SectionType }) {
  const symbol = SYMBOLS[type];
  return symbol ? (
    <span className={cn(styles.symbol, styles[type])}>{symbol}</span>
  ) : null;
}

function Count({ count }: { count?: number | string }) {
  return count === undefined ? null : (
    <span className={styles.count}>{count}</span>
  );
}

export function CollapsibleSection({
  title,
  count,
  type,
  className,
  children,
  open = true,
  onToggle,
  ...props
}: {
  title: string;
  count?: number | string;
  type?: SectionType;
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
      <summary>
        {title}
        <Count count={count} />
        <SectionSymbol type={type} />
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
  type,
}: {
  title: string;
  children: any;
  className?: string;
  count?: number | string;
  type?: SectionType;
}) {
  const name = sectionName(title);
  const ref = useSectionTarget<HTMLDivElement>(name);

  return (
    <div ref={ref} className={cn(className, styles.root)}>
      <h3>
        {title}
        <Count count={count} />
        <SectionSymbol type={type} />
      </h3>
      <SectionBody>{children}</SectionBody>
    </div>
  );
}
