import type { HTMLProps } from 'react';
import { cn } from '../lib/dom.ts';

export function Pane({ children, ...props }: HTMLProps<HTMLDivElement>) {
  props = { ...props, className: cn('pane', props.className) };
  return <div {...props}>{children}</div>;
}
