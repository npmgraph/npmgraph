import { useControls } from 'react-zoom-pan-pinch';
import ZoomFitIcon from 'jsx:../../images/icons/zoom-fit.svg';
import * as styles from './GraphDiagramZoomButtons.module.scss';
import { zoomAroundCenter } from './viewport-util.ts';

export function GraphDiagramZoomButtons() {
  const controls = useControls();

  return (
    <div className={styles.root}>
      <button
        type="button"
        title="Zoom to actual size"
        onClick={() => {
          zoomAroundCenter(controls, 1);
        }}
      >
        1:1
      </button>
      <button
        type="button"
        title="Zoom to fit"
        onClick={() => {
          void controls.fitToView({ maxScale: 1 });
        }}
      >
        <ZoomFitIcon />
      </button>
    </div>
  );
}
