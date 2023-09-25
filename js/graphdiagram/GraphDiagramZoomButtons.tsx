import React from 'react';
import useHashProp from '../util/useHashProp.js';
import { ZOOM_FIT_HEIGHT, ZOOM_FIT_WIDTH, ZOOM_NONE } from './GraphDiagram.js';

export function GraphDiagramZoomButtons() {
  const [zoom, setZoom] = useHashProp('z');
  return (
    <>
      <button
        className={`material-icons ${zoom == ZOOM_FIT_WIDTH ? 'selected' : ''}`}
        onClick={() => setZoom(ZOOM_FIT_WIDTH)}
        title="zoom (fit width)"
        style={{ borderRadius: '3px 0 0 3px' }}
      >
        swap_horiz
      </button>
      <button
        className={zoom == ZOOM_NONE ? 'selected' : ''}
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
        className={`material-icons ${
          zoom == ZOOM_FIT_HEIGHT ? 'selected' : ''
        }`}
        onClick={() => setZoom(ZOOM_FIT_HEIGHT)}
        title="zoom (fit height)"
        style={{ borderRadius: '0 3px 3px 0' }}
      >
        swap_vert
      </button>
    </>
  );
}
