import type { HTMLAttributes, ReactNode } from 'react';
import * as listStyles from '../ReportPane/reports/ModuleList.module.css';
import * as styles from './ModuleNotices.module.css';

export function ModuleNotices({ children }: { children: ReactNode }) {
  return (
    <div className={styles.root}>
      <hr />
      <dl className={styles.list}>{children}</dl>
    </div>
  );
}

// Icon first, then a bold heading, then the details
export function Notice({
  icon,
  heading,
  children,
  ...props
}: { icon: ReactNode; heading: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props}>
      <dt>
        <span className={styles.icon}>{icon}</span>
        {heading}
      </dt>
      <dd className={listStyles.details}>{children}</dd>
    </div>
  );
}
