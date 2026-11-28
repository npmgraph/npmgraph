import ScreenNormalIcon from 'octicons-plain-react/ScreenNormal';
import { useControls, useTransformComponent } from 'react-zoom-pan-pinch';
import { Button, ButtonGroup } from '../Button.tsx';
import { zoomAroundCenter } from './viewport-util.ts';

// `fitScale` is the scale at which the whole graph fits the view, up to 1
export function GraphDiagramZoomButtons({ fitScale }: { fitScale: number }) {
  const controls = useControls();
  const scale = useTransformComponent(({ state }) => state.scale);

  const isScale = (target: number) => Math.abs(scale - target) < 0.001;

  // Nothing to do if the graph is already at 1:1 and fits entirely
  if (fitScale === 1 && isScale(1)) {
    return null;
  }

  return (
    <ButtonGroup square>
      <Button
        selected={isScale(1)}
        title="Zoom to actual size"
        onClick={() => {
          zoomAroundCenter(controls, 1);
        }}
      >
        1:1
      </Button>
      <Button
        selected={isScale(fitScale)}
        title="Zoom to fit"
        onClick={() => {
          void controls.fitToView({ maxScale: 1 });
        }}
      >
        <ScreenNormalIcon />
      </Button>
    </ButtonGroup>
  );
}
