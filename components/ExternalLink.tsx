import type React from 'react';
import type { HTMLProps } from 'react';
import { cn } from '../lib/dom.js';
import { type IconProps, OffsiteLinkIcon } from './Icons.js';

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
  icon?: (props: IconProps) => React.JSX.Element;
}) {
  return (
    <a
      href={href}
      className={cn('bright-hover', 'external-link', className)}
      target={target}
      {...props}
    >
      {children}
      <IconComponent style={{ marginLeft: '0.2rem' }} />
    </a>
  );
}
