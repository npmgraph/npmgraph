import React, { HTMLProps, SVGProps } from 'react';
import { cn } from '../lib/dom.js';

import './Icons.scss';

// SVG icons.  To create a new icon, get the icon's SVG `path` and copy-paste it
// here.  The path should fit w/in a 16x16 box (with a ~0.5px margin).  The paths provided by octicons work pretty well for this, but may need to be scaled.

export type IconProps = {
  name?: string;
  strokePath?: string;
  fillPath?: string;

  width?: number | string;
  height?: number | string;
} & HTMLProps<SVGSVGElement>;

// General SVG-based icon component path.
export default function Icon({
  name,
  strokePath,
  fillPath,
  width = 16,
  height = 16,
  className,
  ...props
}: IconProps & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox={`0 0 16 16`}
      width={width}
      height={height}
      className={cn('icon', { [`icon-${name}`]: name }, className)}
      {...props}
    >
      {fillPath ? <path d={fillPath} className="icon-path-fill"></path> : null}
      {strokePath ? (
        <path d={strokePath} className="icon-path-stroke"></path>
      ) : null}
    </svg>
  );
}

// Paths for these can be found in art/icons.svg

export function GithubIcon(props: IconProps) {
  // Original path from https://primer.style/design/foundations/icons/mark-github-16
  return (
    <Icon
      {...props}
      fillPath="m 8,1 c 4,0 7.2,3.2 7.2,7.2 a 7.2,7.2 0 0 1 -4.9,6.8 c -0.4,0.1 -0.5,-0.1 -0.5,-0.3 0,-0.2 0,-1 0,-2 0,-0.7 -0.2,-1.1 -0.5,-1.3 1.6,-0.2 3.3,-0.8 3.3,-3.5 0,-0.8 -0.3,-1.4 -0.7,-1.9 0.1,-0.2 0.3,-0.9 -0.1,-1.9 0,0 -0.6,-0.2 -2,0.7 -0.6,-0.2 -1.2,-0.2 -1.8,-0.2 -0.6,0 -1.2,0.1 -1.8,0.2 -1.4,-0.9 -2,-0.7 -2,-0.7 -0.4,1 -0.1,1.7 -0.1,1.9 -0.5,0.5 -0.7,1.1 -0.7,1.9 0,2.7 1.7,3.4 3.3,3.5 -0.2,0.2 -0.4,0.5 -0.5,1 -0.4,0.2 -1.4,0.5 -2.1,-0.6 -0.1,-0.2 -0.5,-0.7 -1.1,-0.7 -0.6,0 -0.2,0.3 0,0.5 0.3,0.2 0.7,0.8 0.7,1 0.1,0.4 0.6,1.2 2.4,0.8 0,0.6 0,1.2 0,1.3 0,0.2 -0.1,0.4 -0.5,0.3 A 7.2,7.2 0 0 1 0.8,8.2 c 0,-4 3.2,-7.2 7.2,-7.2 z"
    />
  );
}

export function ZoomHorizontalIcon(props: IconProps) {
  return (
    <Icon
      name="zoom-horizontal"
      {...props}
      strokePath="M 13,8 H 3 M 5,5 3,8 5,11 m 6,-6 2,3 -2,3 M 4,1 H 1 V 15 H 4 M 12,1 h 3 v 14 h -3"
    />
  );
}

export function ZoomVerticalIcon(props: IconProps) {
  return (
    <Icon
      name="zoom-vertical"
      {...props}
      strokePath="m 8,3 v 10 m -3,-2 3,2 3,-2 M 5,5 8,3 11,5 M 1,12 v 3 H 15 V 12 M 1,4 V 1 h 14 v 3"
    />
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <Icon
      name="download"
      {...props}
      strokePath="m 10,11 c 0,0 -0,3 2,4 H 4 c 2,-1 2,-4 2,-4 m 5,-9 h 4 v 9 H 1 V 2 H 5 M 10,6 8,8 6,6 M 8,1 v 7"
    />
  );
}

export function OffsiteLinkIcon(props: IconProps) {
  return (
    <Icon
      name="offsite-link"
      {...props}
      strokePath="m 13,7 v 7 H 2 V 3 h 7 m 2,-2 h 4 v 4 z m 2,2 -5,5"
    />
  );
}

export function SponsorIcon(props: IconProps) {
  return (
    <Icon
      name="sponsor"
      {...props}
      strokePath="M 8,4 C 13,-1 20,6 8,14 -4,6 3,-1 8,4 Z"
    />
  );
}
