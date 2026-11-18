import type { HTMLProps } from 'react';
import * as styles from './LegendColor.module.css';

const largeCircle = '\u{2B24}';

export function LegendColor({
  color,
  children,
  ...props
}: Omit<HTMLProps<HTMLDivElement>, 'color'> & {
  color: 'red' | 'orange' | 'yellow' | 'green' | 'blue';
}) {
  return (
    <div {...props}>
      <span className={`${styles.dot} ${styles[color]}`}>{largeCircle}</span>
      {children}
    </div>
  );
}
