import { useControls, useTransformComponent } from 'react-zoom-pan-pinch';
import ZoomFitIcon from '../../images/icons/zoom-fit.svg?react';
import Tooltip from '../ui/Tooltip.tsx';
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
      <Tooltip label="Zoom to actual size">
        {props => (
          <Button
            {...props}
            onClick={() => {
              zoomAroundCenter(controls, 1);
            }}
          >
            1:1
          </Button>
        )}
      </Tooltip>
      <Tooltip label="Zoom to fit">
        {props => (
          <Button
            {...props}
            onClick={() => {
              void controls.fitToView({ maxScale: 1 });
            }}
          >
            <ZoomFitIcon />
          </Button>
        )}
      </Tooltip>
    </ButtonGroup>
  );
}
