import { useControls, useTransformComponent } from 'react-zoom-pan-pinch';
import ZoomFitIcon from '../../images/icons/zoom-fit.svg?react';
import { Button, ButtonGroup } from '../Button.tsx';
import { zoomAroundCenter } from './viewport-util.ts';

// `fitScale` is the scale at which the whole graph fits the view, up to 1
export function GraphDiagramZoomButtons({ fitScale }: { fitScale: number }) {
  const controls = useControls();
  const scale = useTransformComponent(({ state }) => state.scale);

  // Nothing to do if the graph is already at 1:1 and fits entirely
  if (fitScale === 1 && Math.abs(scale - 1) < 0.001) {
    return null;
  }

  return (
    <ButtonGroup square>
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
