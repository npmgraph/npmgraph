import type { CSSProperties } from 'react';
import human from '../../lib/human.ts';
import * as styles from './SizeBar.module.css';

const format = (bytes?: number) => (bytes ? human(bytes, 'B') : <i>n/a</i>);

// The bar is the total, its filled part is the share of the first size
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
    <div className={styles.root}>
      <span className={styles.label}>{title}</span>
      {size && total ? (
        <div
          className={styles.bar}
          style={{ '--share': `${(size / total) * 100}%` } as CSSProperties}
        />
      ) : null}
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
