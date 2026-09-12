import {
  PARAM_ZOOM,
  ZOOM_FIT_HEIGHT,
  ZOOM_FIT_WIDTH,
  ZOOM_NONE,
} from '../../lib/constants.ts';
import { cn } from '../../lib/dom.ts';
import useHashParam from '../../lib/useHashParam.ts';
import { ZoomHorizontalIcon, ZoomVerticalIcon } from '../Icons.tsx';
import * as utilities from '../utilities.module.scss';
import * as parentStyles from './GraphDiagram.module.scss';
import * as styles from './GraphDiagramZoomButtons.module.scss';

export function GraphDiagramZoomButtons() {
  const [zoom, setZoom] = useHashParam(PARAM_ZOOM);
  return (
    <div className={styles.root}>
      <button
        className={cn(
          styles.zoomFitWidth,
          { [parentStyles.selected]: zoom === ZOOM_FIT_WIDTH },
          utilities.brightHover,
        )}
        onClick={() => {
          setZoom(ZOOM_FIT_WIDTH);
        }}
        title="Zoom (fit width)"
        type="button"
      >
        <ZoomHorizontalIcon />
      </button>
      <button
        className={cn(
          styles.zoom11,
          { [parentStyles.selected]: zoom === ZOOM_NONE },
          utilities.brightHover,
        )}
        onClick={() => {
          setZoom(ZOOM_NONE);
        }}
        title="Zoom (1:1)"
        type="button"
      >
        1:1
      </button>
      <button
        className={cn(
          styles.zoomFitHeight,
          { [parentStyles.selected]: zoom === ZOOM_FIT_HEIGHT },
          utilities.brightHover,
        )}
        onClick={() => {
          setZoom(ZOOM_FIT_HEIGHT);
        }}
        title="Zoom (fit height)"
        type="button"
      >
        <ZoomVerticalIcon />
      </button>
    </div>
  );
}
