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
      viewBox="0 0 16 16"
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

export function Package(props: IconProps) {
  // Original path from https://primer.style/foundations/icons/package-16
  return (
    <Icon
      {...props}
      fillPath="m8.878.392 5.25 3.045c.54.314.872.89.872 1.514v6.098a1.75 1.75 0 0 1-.872 1.514l-5.25 3.045a1.75 1.75 0 0 1-1.756 0l-5.25-3.045A1.75 1.75 0 0 1 1 11.049V4.951c0-.624.332-1.201.872-1.514L7.122.392a1.75 1.75 0 0 1 1.756 0ZM7.875 1.69l-4.63 2.685L8 7.133l4.755-2.758-4.63-2.685a.248.248 0 0 0-.25 0ZM2.5 5.677v5.372c0 .09.047.171.125.216l4.625 2.683V8.432Zm6.25 8.271 4.625-2.683a.25.25 0 0 0 .125-.216V5.677L8.75 8.432Z"
    />
  );
}

export function NpmIcon(props: IconProps) {
  // Original path from https://worldvectorlogo.com/downloaded/npm-square
  return (
    <Icon
      {...props}
      viewBox="268.5 268.5 1962.9 1962.9"
      fillPath="M1241.5 268.5h-973v1962.9h972.9V763.5h495v1467.9h495V268.5z"
    />
  );
}

export function GithubIcon(props: IconProps) {
  // Original path from https://primer.style/foundations/icons/mark-github-16
  return (
    <Icon
      {...props}
      fillPath="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"
    />
  );
}

// Paths for these can be found in art/icons.svg

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
