import React from 'react';

// SVG icons.  To create a new icon, get the icon's SVG `path` and copy-paste it
// here.  The path should fit w/in a 16x16 box (with a ~0.5px margin).  The paths provided by octicons work pretty well for this, but may need to be scaled.

export function GithubIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      style={{ fill: 'currentColor)', width: '1lh', height: '1lh' }}
    >
      <path d="m 8,1 c 4,0 7.2,3.2 7.2,7.2 a 7.2,7.2 0 0 1 -4.9,6.8 c -0.4,0.1 -0.5,-0.1 -0.5,-0.3 0,-0.2 0,-1 0,-2 0,-0.7 -0.2,-1.1 -0.5,-1.3 1.6,-0.2 3.3,-0.8 3.3,-3.5 0,-0.8 -0.3,-1.4 -0.7,-1.9 0.1,-0.2 0.3,-0.9 -0.1,-1.9 0,0 -0.6,-0.2 -2,0.7 -0.6,-0.2 -1.2,-0.2 -1.8,-0.2 -0.6,0 -1.2,0.1 -1.8,0.2 -1.4,-0.9 -2,-0.7 -2,-0.7 -0.4,1 -0.1,1.7 -0.1,1.9 -0.5,0.5 -0.7,1.1 -0.7,1.9 0,2.7 1.7,3.4 3.3,3.5 -0.2,0.2 -0.4,0.5 -0.5,1 -0.4,0.2 -1.4,0.5 -2.1,-0.6 -0.1,-0.2 -0.5,-0.7 -1.1,-0.7 -0.6,0 -0.2,0.3 0,0.5 0.3,0.2 0.7,0.8 0.7,1 0.1,0.4 0.6,1.2 2.4,0.8 0,0.6 0,1.2 0,1.3 0,0.2 -0.1,0.4 -0.5,0.3 A 7.2,7.2 0 0 1 0.8,8.2 c 0,-4 3.2,-7.2 7.2,-7.2 z"></path>
    </svg>
  );
}

export function ZoomHorizontalIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      style={{ stroke: 'currentColor)', width: '1lh', height: '1lh' }}
    >
      <path d="M 14,8 H 2 M 4,5 2,8 4,11 m 8,-6 2,3 -2,3 M 4,1 H 1 V 15 H 4 M 12,1 h 3 v 14 h -3"></path>
    </svg>
  );
}

export function ZoomVerticalIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      style={{ stroke: 'currentColor)', width: '1lh', height: '1lh' }}
    >
      <path d="m 8,2 v 12 m -3,-2 3,2 3,-2 M 5,4 8,2 11,4 M 1,12 v 3 H 15 V 12 M 1,4 V 1 h 14 v 3"></path>
    </svg>
  );
}
