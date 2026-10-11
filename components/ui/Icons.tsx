import DownloadSvg from 'jsx:../../images/icons/download.svg';
import GithubSvg from 'jsx:../../images/icons/github.svg';
import OffsiteLinkSvg from 'jsx:../../images/icons/offsite-link.svg';
import XSvg from 'jsx:../../images/icons/x.svg';
import ZoomHorizontalSvg from 'jsx:../../images/icons/zoom-horizontal.svg';
import ZoomVerticalSvg from 'jsx:../../images/icons/zoom-vertical.svg';
import type { ComponentType, HTMLProps, SVGProps } from 'react';
import { cn } from '../../lib/dom.ts';

import * as styles from './Icons.module.scss';

// SVG icons.  To create a new icon, add an SVG file to images/icons/ with a
// single path that fits w/in a 16x16 box (with a ~0.5px margin), set its fill
// or stroke on the path, and add a component for it here.  The paths provided
// by octicons work pretty well for this, but may need to be scaled.

export type IconProps = {
  name?: string;

  width?: number | string;
  height?: number | string;
} & HTMLProps<SVGSVGElement>;

// General SVG-based icon component, for the SVG files imported with `jsx:`
function Icon({
  Svg,
  name,
  width = 16,
  height = 16,
  className,
  ...props
}: IconProps & { Svg: ComponentType<SVGProps<SVGSVGElement>> }) {
  return (
    <Svg
      // svgo.config.json removes the viewBox of the files
      viewBox="0 0 16 16"
      width={width}
      height={height}
      className={cn(
        styles.icon,
        { [styles.iconSponsor]: name === 'sponsor' },
        className,
      )}
      {...props}
    />
  );
}

export function GithubIcon(props: IconProps) {
  return <Icon Svg={GithubSvg} {...props} />;
}

// The artwork for these can be found in art/icons.svg

export function ZoomHorizontalIcon(props: IconProps) {
  return <Icon name="zoom-horizontal" Svg={ZoomHorizontalSvg} {...props} />;
}

export function ZoomVerticalIcon(props: IconProps) {
  return <Icon name="zoom-vertical" Svg={ZoomVerticalSvg} {...props} />;
}

export function DownloadIcon(props: IconProps) {
  return <Icon name="download" Svg={DownloadSvg} {...props} />;
}

export function OffsiteLinkIcon(props: IconProps) {
  return <Icon name="offsite-link" Svg={OffsiteLinkSvg} {...props} />;
}

export function XIcon(props: IconProps) {
  return <Icon name="x" Svg={XSvg} {...props} />;
}
