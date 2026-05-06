import * as indexStyles from '../../index.module.scss';
import {
  PARAM_ZOOM,
  ZOOM_FIT_HEIGHT,
  ZOOM_FIT_WIDTH,
  ZOOM_NONE,
} from '../../lib/constants.ts';
import { cn } from '../../lib/dom.ts';
import useHashParam from '../../lib/useHashParam.ts';
import { ZoomHorizontalIcon, ZoomVerticalIcon } from '../Icons.tsx';

export function GraphDiagramZoomButtons() {
  const [zoom, setZoom] = useHashParam(PARAM_ZOOM);
  return (
    <div id="zoom-buttons">
      <button
        id="zoom-fit-width"
        className={cn(
          { selected: zoom === ZOOM_FIT_WIDTH },
          indexStyles.brightHover,
        )}
        onClick={() => setZoom(ZOOM_FIT_WIDTH)}
        title="Zoom (fit width)"
        type="button"
      >
        <ZoomHorizontalIcon />
      </button>
      <button
        id="zoom-none"
        className={cn(
          { selected: zoom === ZOOM_NONE },
          indexStyles.brightHover,
        )}
        onClick={() => setZoom(ZOOM_NONE)}
        title="Zoom (1:1)"
        style={{
          fontSize: '1em',
          padding: '0 .5em',
          width: 'fit-content',
          borderWidth: '1px 0px',
        }}
        type="button"
      >
        1:1
      </button>
      <button
        id="zoom-fit-height"
        className={cn(
          { selected: zoom === ZOOM_FIT_HEIGHT },
          indexStyles.brightHover,
        )}
        onClick={() => setZoom(ZOOM_FIT_HEIGHT)}
        title="Zoom (fit height)"
        type="button"
      >
        <ZoomVerticalIcon />
      </button>
    </div>
  );
}
