import { useControls } from 'react-zoom-pan-pinch';
import ZoomFitIcon from '../../images/icons/zoom-fit.svg?react';
import { Button, ButtonGroup } from '../Button.tsx';
import { zoomAroundCenter } from './viewport-util.ts';

export function GraphDiagramZoomButtons() {
  const controls = useControls();

  return (
    <ButtonGroup>
      <Button
        title="Zoom to actual size"
        onClick={() => {
          zoomAroundCenter(controls, 1);
        }}
      >
        1:1
      </Button>
      <Button
        title="Zoom to fit"
        onClick={() => {
          void controls.fitToView({ maxScale: 1 });
        }}
      >
        <ZoomFitIcon />
      </Button>
    </ButtonGroup>
  );
}
