import {
  PARAM_ZOOM,
  ZOOM_FIT_HEIGHT,
  ZOOM_FIT_WIDTH,
  ZOOM_NONE,
} from '../../lib/constants.ts';
import useHashParam from '../../hooks/useHashParam.ts';
import ZoomHorizontalIcon from '../../images/icons/zoom-horizontal.svg?react';
import ZoomVerticalIcon from '../../images/icons/zoom-vertical.svg?react';
import { Button, ButtonGroup } from '../Button.tsx';

export function GraphDiagramZoomButtons() {
  const [zoom, setZoom] = useHashParam(PARAM_ZOOM);
  return (
    <ButtonGroup>
      <Button
        selected={zoom === ZOOM_FIT_WIDTH}
        title="Zoom (fit width)"
        onClick={() => {
          setZoom(ZOOM_FIT_WIDTH);
        }}
      >
        <ZoomHorizontalIcon />
      </Button>
      <Button
        selected={zoom === ZOOM_NONE}
        title="Zoom (1:1)"
        onClick={() => {
          setZoom(ZOOM_NONE);
        }}
      >
        1:1
      </Button>
      <Button
        selected={zoom === ZOOM_FIT_HEIGHT}
        title="Zoom (fit height)"
        onClick={() => {
          setZoom(ZOOM_FIT_HEIGHT);
        }}
      >
        <ZoomVerticalIcon />
      </Button>
    </ButtonGroup>
  );
}
