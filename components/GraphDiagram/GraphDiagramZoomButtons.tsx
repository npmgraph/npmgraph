import React from 'react';
import {
  PARAM_ZOOM,
  ZOOM_FIT_HEIGHT,
  ZOOM_FIT_WIDTH,
  ZOOM_NONE,
} from '../../lib/constants.js';
import { cn } from '../../lib/dom.js';
import useHashParam from '../../lib/useHashParam.js';
import { ZoomHorizontalIcon, ZoomVerticalIcon } from '../Icons.js';

export function GraphDiagramZoomButtons() {
  const [zoom, setZoom] = useHashParam(PARAM_ZOOM);
  return (
    <div id="zoom-buttons">
      <button
        id="zoom-fit-width"
        className={cn({ selected: zoom === ZOOM_FIT_WIDTH }, 'bright-hover')}
        onClick={() => setZoom(ZOOM_FIT_WIDTH)}
        title="Zoom (fit width)"
        type="button"
      >
        <ZoomHorizontalIcon />
      </button>
      <button
        id="zoom-none"
        className={cn({ selected: zoom === ZOOM_NONE }, 'bright-hover')}
        onClick={() => setZoom(ZOOM_NONE)}
        title="Zoom (1:1)"
        style={{
          fontSize: '1em',
          padding: '0 .5em',
          width: 'fit-content',
          borderWidth: '1px 0px',
        }}
      >
        1:1
      </button>
      <button
        id="zoom-fit-height"
        className={cn({ selected: zoom === ZOOM_FIT_HEIGHT }, 'bright-hover')}
        onClick={() => setZoom(ZOOM_FIT_HEIGHT)}
        title="Zoom (fit height)"
        type="button"
      >
        <ZoomVerticalIcon />
      </button>
    </div>
  );
}
