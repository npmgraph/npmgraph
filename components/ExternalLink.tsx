import type { HTMLProps, ReactElement } from 'react';
import { cn } from '../lib/dom.js';
import { OffsiteLinkIcon, type IconProps } from './Icons.js';

import './ExternalLink.scss';

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
      className={cn('bright-hover', 'external-link', className)}
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
