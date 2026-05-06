import type { HTMLProps } from 'react';
import * as indexStyles from '../index.module.scss';
import { cn } from '../lib/dom.ts';
import * as styles from './Tab.module.scss';

export function Tab({
  active,
  children,
  ...props
}: HTMLProps<HTMLDivElement> & {
  active: boolean;
}) {
  return (
    <div className={cn(styles.tab, { [styles.active]: active })} {...props}>
      <button type="button" className={indexStyles.brightHover}>
        {children}
      </button>
    </div>
  );
}
