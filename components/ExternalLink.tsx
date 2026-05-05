import type { HTMLProps, ReactElement } from 'react';
import { cn } from '../lib/dom.ts';
import type { IconProps } from './Icons.tsx';
import { OffsiteLinkIcon } from './Icons.tsx';

import * as styles from './ExternalLink.module.scss';

export function ExternalLink({
  href,
  children,
  target = '_blank',
  icon: IconComponent = OffsiteLinkIcon,
  className,
  ...props
}: HTMLProps<HTMLAnchorElement> & {
  className?: string;
  icon?: (props: IconProps) => ReactElement;
}) {
  return (
    <a
      href={href}
      className={cn('bright-hover', styles.externalLink, className)}
      target={target}
      {...props}
    >
      {children}
      <IconComponent
        style={{ marginLeft: '0.3rem', verticalAlign: '-0.1em' }}
        width={12}
        height={12}
      />
    </a>
  );
}
