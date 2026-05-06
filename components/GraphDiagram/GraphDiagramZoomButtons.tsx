import {
  PARAM_ZOOM,
  ZOOM_FIT_HEIGHT,
  ZOOM_FIT_WIDTH,
  ZOOM_NONE,
} from '../../lib/constants.ts';
import { cn } from '../../lib/dom.ts';
import useHashParam from '../../lib/useHashParam.ts';
import { ZoomHorizontalIcon, ZoomVerticalIcon } from '../Icons.tsx';
import * as styles from './GraphDiagramZoomButtons.module.scss';

export function GraphDiagramZoomButtons() {
  const [zoom, setZoom] = useHashParam(PARAM_ZOOM);
  return (
    <div className={styles.root}>
      <button
        className={cn(
          styles.zoomFitWidth,
          { selected: zoom === ZOOM_FIT_WIDTH },
          'bright-hover',
        )}
        onClick={() => setZoom(ZOOM_FIT_WIDTH)}
        title="Zoom (fit width)"
        type="button"
      >
        <ZoomHorizontalIcon />
      </button>
      <button
        className={cn(
          styles.zoom11,
          { selected: zoom === ZOOM_NONE },
          'bright-hover',
        )}
        onClick={() => setZoom(ZOOM_NONE)}
        title="Zoom (1:1)"
        type="button"
      >
        1:1
      </button>
      <button
        className={cn(
          styles.zoomFitHeight,
          { selected: zoom === ZOOM_FIT_HEIGHT },
          'bright-hover',
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
