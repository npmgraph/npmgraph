import React from 'react';
import {
  PARAM_ZOOM,
  ZOOM_FIT_HEIGHT,
  ZOOM_FIT_WIDTH,
  ZOOM_NONE,
} from '../../lib/constants.js';
import { cn } from '../../lib/dom.js';
import useHashParam from '../../lib/useHashParam.js';

export function GraphDiagramZoomButtons() {
  const [zoom, setZoom] = useHashParam(PARAM_ZOOM);
  return (
    <>
      <button
        className={cn('material-icons', { selected: zoom == ZOOM_FIT_WIDTH })}
        onClick={() => setZoom(ZOOM_FIT_WIDTH)}
        title="zoom (fit width)"
        style={{ borderRadius: '3px 0 0 3px' }}
      >
        swap_horiz
      </button>
      <button
        className={cn({ selected: zoom == ZOOM_NONE })}
        onClick={() => setZoom(ZOOM_NONE)}
        title="zoom (1:1)"
        style={{
          fontSize: '1em',
          padding: '0 .5em',
          width: 'fit-content',
          borderWidth: '1px 0px',
          borderRadius: 0,
        }}
      >
        1:1
      </button>
      <button
        className={cn('material-icons', { selected: zoom == ZOOM_FIT_HEIGHT })}
        onClick={() => setZoom(ZOOM_FIT_HEIGHT)}
        title="zoom (fit height)"
        style={{ borderRadius: '0 3px 3px 0' }}
      >
        swap_vert
      </button>
    </>
  );
}
