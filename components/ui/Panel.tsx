import type { ReactNode } from 'react';
import { cn } from '../../lib/dom.ts';
import * as styles from './Panel.module.scss';

// A collapsible panel that shares the inspector with others, like in Photoshop's sidebar
export function Panel({
  title,
  subtitle,
  isOpen,
  onToggle,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(styles.panel, { [styles.open]: isOpen }, className)}
      aria-label={title}
    >
      <button
        type="button"
        className={styles.header}
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </button>
      {isOpen && (
        <div className={cn(styles.body, bodyClassName)}>{children}</div>
      )}
    </section>
  );
}
