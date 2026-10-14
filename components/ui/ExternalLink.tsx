import OffsiteLinkIcon from '../../images/icons/offsite-link.svg?react';
import type { ComponentType, HTMLProps, SVGProps } from 'react';
import { cn } from '../../lib/dom.ts';
import * as utilities from './utilities.module.scss';

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
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
}) {
  return (
    <a
      href={href}
      className={cn(utilities.brightHover, styles.externalLink, className)}
      target={target}
      {...props}
    >
      {children}
      <IconComponent
        // svgo.config.json removes the viewBox of the files, which is needed to resize them
        viewBox="0 0 16 16"
        style={{ marginLeft: '0.3rem', verticalAlign: '-0.1em' }}
        width={12}
        height={12}
      />
    </a>
  );
}
