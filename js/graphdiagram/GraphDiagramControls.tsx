import React from 'react';
import GraphDiagramDownloadButton from './GraphDiagramDownloadButton.js';

export function GraphDiagramControls({
  zoom,
  setZoom,
}: {
  zoom: number;
  setZoom: (zoom: number) => void;
}) {
  return (
    <div id="graph-controls">
      <button
        className={`material-icons ${zoom == 1 ? 'selected' : ''}`}
        onClick={() => setZoom(1)}
        title="zoom (fit width)"
        style={{ borderRadius: '3px 0 0 3px' }}
      >
        swap_horiz
      </button>
      <button
        className={zoom == 0 ? 'selected' : ''}
        onClick={() => setZoom(0)}
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
        className={`material-icons ${zoom == 2 ? 'selected' : ''}`}
        onClick={() => setZoom(2)}
        title="zoom (fit height)"
        style={{ borderRadius: '0 3px 3px 0' }}
      >
        swap_vert
      </button>
      <GraphDiagramDownloadButton />
    </div>
  );
}
