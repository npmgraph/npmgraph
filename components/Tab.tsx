import type { HTMLProps } from 'react';
import { cn } from '../lib/dom.ts';
import styles from './Tab.module.scss';

const tabStyles = styles as Record<string, string>;

export function Tab({
  active,
  badge,
  children,
  ...props
}: HTMLProps<HTMLDivElement> & {
  active: boolean;
  badge?: string | number | boolean;
}) {
  return (
    <div
      className={cn(tabStyles.root, { [tabStyles.active]: active })}
      {...props}
    >
      <button type="button" className="bright-hover">
        {children}
        {badge && (
          <span className={tabStyles.badge}>
            {badge === true ? ' ' : badge}
          </span>
        )}
      </button>
    </div>
  );
}
