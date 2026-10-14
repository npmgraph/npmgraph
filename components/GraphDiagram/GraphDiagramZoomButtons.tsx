import {
  PARAM_ZOOM,
  ZOOM_FIT_HEIGHT,
  ZOOM_FIT_WIDTH,
  ZOOM_NONE,
} from '../../lib/constants.ts';
import { getHashParameter } from '../../lib/hash-util.ts';
import ZoomHorizontalIcon from 'jsx:../../images/icons/zoom-horizontal.svg';
import ZoomVerticalIcon from 'jsx:../../images/icons/zoom-vertical.svg';
import { Button, ButtonGroup } from '../Button.tsx';

export function GraphDiagramZoomButtons() {
  const [zoom, setZoom] = getHashParameter(PARAM_ZOOM);
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
