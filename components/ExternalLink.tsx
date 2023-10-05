import React, { HTMLProps } from 'react';
import { OffsiteLinkIcon } from './Icons.js';

export function ExternalLink({
  href,
  children,
  target = '_blank',
  className,
  ...props
}: HTMLProps<HTMLAnchorElement> & { className?: string }) {
  return (
    <a
      href={href}
      className={`bright-hover ${className ?? ''}`}
      target={target}
      {...props}
    >
      {children}
      <OffsiteLinkIcon style={{ marginLeft: '0.25em' }} />
    </a>
  );
}
