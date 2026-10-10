import { useControls } from 'react-zoom-pan-pinch';
import { ZoomFitIcon, ZoomInIcon, ZoomOutIcon } from '../ui/Icons.tsx';
import * as styles from './GraphDiagramZoomButtons.module.scss';

export function GraphDiagramZoomButtons() {
  const { zoomIn, zoomOut, fitToView } = useControls();

  return (
    <div className={styles.root}>
      <button
        type="button"
        title="Zoom in"
        onClick={() => {
          void zoomIn();
        }}
      >
        <ZoomInIcon />
      </button>
      <button
        type="button"
        title="Zoom out"
        onClick={() => {
          void zoomOut();
        }}
      >
        <ZoomOutIcon />
      </button>
      <button
        type="button"
        title="Zoom to fit"
        onClick={() => {
          void fitToView({ maxScale: 1 });
        }}
      >
        <ZoomFitIcon />
      </button>
    </div>
  );
}
