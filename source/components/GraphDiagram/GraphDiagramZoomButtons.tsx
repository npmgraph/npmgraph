import ScreenNormalIcon from 'octicons-plain-react/ScreenNormal';
import { useState } from 'react';
import { useControls, useTransformComponent } from 'react-zoom-pan-pinch';
import { Button, ButtonGroup } from '../Button.tsx';
import { zoomAroundCenter } from './viewport-util.ts';

const animationTime = 200;
const isScale = (a: number, b: number) => Math.abs(a - b) < 0.001;

// `fitScale` is the scale at which the whole graph fits the view, up to 1
export function GraphDiagramZoomButtons({ fitScale }: { fitScale: number }) {
  const controls = useControls();
  const scale = useTransformComponent(({ state }) => state.scale);

  const [target, setTarget] = useState<number>();

  // Nothing to do if the graph is already at 1:1 and fits entirely
  if (fitScale === 1 && isScale(scale, 1)) {
    return null;
  }

  // Zooming is animated, so show the target as selected right away
  const zoomTo = (newScale: number, zoom: () => void) => {
    setTarget(newScale);
    zoom();
    setTimeout(() => {
      setTarget(undefined);
    }, animationTime);
  };

  return (
    <ButtonGroup square>
      <Button
        selected={isScale(target ?? scale, 1)}
        title="Zoom to actual size"
        onClick={() => {
          zoomTo(1, () => {
            zoomAroundCenter(controls, 1, animationTime);
          });
        }}
      >
        1:1
      </Button>
      <Button
        selected={isScale(target ?? scale, fitScale)}
        title="Zoom to fit"
        onClick={() => {
          zoomTo(fitScale, () => {
            void controls.fitToView({ maxScale: 1, animationTime });
          });
        }}
      >
        <ScreenNormalIcon />
      </Button>
    </ButtonGroup>
  );
}
