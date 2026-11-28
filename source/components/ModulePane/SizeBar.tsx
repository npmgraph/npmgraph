import type { CSSProperties } from 'react';
import human from '../../lib/human.ts';
import * as styles from './SizeBar.module.css';

const format = (bytes?: number) => (bytes ? human(bytes, 'B') : <i>n/a</i>);

// The background is the total, its tinted part is the share of the first size
export function SizeBar({
  title,
  size,
  sizeLabel,
  total,
  totalLabel,
}: {
  title: string;
  size?: number;
  sizeLabel: string;
  total?: number;
  totalLabel: string;
}) {
  return (
    <div
      className={styles.root}
      style={
        size && total
          ? ({ '--share': `${(size / total) * 100}%` } as CSSProperties)
          : undefined
      }
    >
      <span className={styles.label}>{title}</span>
      <div className={styles.legend}>
        <span>
          <strong>{format(size)}</strong> {sizeLabel}
        </span>
        {total ? (
          <span>
            <strong>{format(total)}</strong> {totalLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
