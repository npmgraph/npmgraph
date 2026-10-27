import { useEffect, useRef, type HTMLProps, type ReactNode } from 'react';
import { PARAM_SECTION } from '../../lib/constants.ts';
import { cn } from '../../lib/dom.ts';
import useHashParam from '../../hooks/useHashParam.ts';

import * as styles from './Section.module.scss';

function Count({ count }: { count?: number | string }) {
  return count === undefined ? null : (
    <span className={styles.count}>{count}</span>
  );
}

function sectionName(title: string) {
  return title.toLowerCase();
}

// Open and scroll to the section named in the URL hash, if it's this one
function useSectionTarget<T extends HTMLElement>(name: string) {
  const [section] = useHashParam(PARAM_SECTION);
  const ref = useRef<T>(null);
  useEffect(() => {
    // eslint-disable-next-line react-you-might-not-need-an-effect/no-event-handler -- Must act on the DOM node after mount
    if (section !== name || !ref.current) {
      return;
    }

    if (ref.current instanceof HTMLDetailsElement) {
      ref.current.open = true;
    }

    ref.current.scrollIntoView?.({ block: 'start' });
  }, [section, name]);

  return ref;
}

export function CollapsibleSection({
  title,
  count,
  icon,
  className,
  children,
  open = true,
  ...props
}: {
  title: string;
  count?: number | string;
  icon?: ReactNode;
  open?: boolean;
} & HTMLProps<HTMLDetailsElement>) {
  const name = sectionName(title);
  const ref = useSectionTarget<HTMLDetailsElement>(name);

  return (
    <details
      ref={ref}
      open={open}
      {...props}
      className={cn(className, styles.root)}
    >
      <summary>
        {title}
        {icon}
        <Count count={count} />
      </summary>
      {children}
    </details>
  );
}

export function Section({
  title,
  children,
  className,
  count,
}: {
  title: string;
  children: any;
  className?: string;
  count?: number | string;
}) {
  const name = sectionName(title);
  const ref = useSectionTarget<HTMLDivElement>(name);

  return (
    <div ref={ref} className={cn(className, styles.root)}>
      <h3>
        {title}
        <Count count={count} />
      </h3>
      {children}
    </div>
  );
}
