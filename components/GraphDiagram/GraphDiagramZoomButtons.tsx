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
          { [parentStyles.selected]: zoom === ZOOM_FIT_WIDTH },
          utilities.brightHover,
        )}
        title="Zoom (fit width)"
        type="button"
        onClick={() => {
          setZoom(ZOOM_FIT_WIDTH);
        }}
      >
        <ZoomHorizontalIcon />
      </button>
      <button
        className={cn(
          { [parentStyles.selected]: zoom === ZOOM_NONE },
          utilities.brightHover,
        )}
        title="Zoom (1:1)"
        type="button"
        onClick={() => {
          setZoom(ZOOM_NONE);
        }}
      >
        1:1
      </button>
      <button
        className={cn(
          { [parentStyles.selected]: zoom === ZOOM_FIT_HEIGHT },
          utilities.brightHover,
        )}
        title="Zoom (fit height)"
        type="button"
        onClick={() => {
          setZoom(ZOOM_FIT_HEIGHT);
        }}
      >
        <ZoomVerticalIcon />
      </button>
    </div>
  );
}
