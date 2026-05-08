import type { HTMLProps } from 'react';
import { cn } from '../lib/dom.ts';
import * as styles from './Pane.module.scss';

export function Pane({ children, ...props }: HTMLProps<HTMLDivElement>) {
  props = { ...props, className: cn(styles.pane, props.className) };
  return <div {...props}>{children}</div>;
}
