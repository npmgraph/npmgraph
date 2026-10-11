import type { ReactZoomPanPinchContentRef } from 'react-zoom-pan-pinch';

/**
The scale at which the whole graph fits the viewport, but never above 1:1.
Returns undefined while the graph or the viewport have no size.
*/
export function getFitScale(wrapper: HTMLElement, content: HTMLElement) {
  if (
    !content.offsetWidth ||
    !content.offsetHeight ||
    !wrapper.clientWidth ||
    !wrapper.clientHeight
  ) {
    return undefined;
  }

  return Math.min(
    1,
    wrapper.clientWidth / content.offsetWidth,
    wrapper.clientHeight / content.offsetHeight,
  );
}

/**
Keeps the graph from moving away from the edges of the viewport, like scrolling
*/
export function clampPosition(
  { instance }: ReactZoomPanPinchContentRef,
  x: number,
  y: number,
  scale: number,
) {
  const { wrapperComponent: wrapper, contentComponent: content } = instance;
  if (!wrapper || !content) {
    return [x, y] as const;
  }

  const clamp = (position: number, viewSize: number, contentSize: number) =>
    Math.min(0, Math.max(viewSize - contentSize * scale, position));

  return [
    clamp(x, wrapper.clientWidth, content.offsetWidth),
    clamp(y, wrapper.clientHeight, content.offsetHeight),
  ] as const;
}

/**
Zoom to the given scale, keeping the center of the viewport where it is
*/
export function zoomAroundCenter(
  controls: ReactZoomPanPinchContentRef,
  newScale: number,
  animationTime = 200,
) {
  const { wrapperComponent: wrapper, state } = controls.instance;
  if (!wrapper) {
    return;
  }

  const centerX = wrapper.clientWidth / 2;
  const centerY = wrapper.clientHeight / 2;
  const ratio = newScale / state.scale;
  const [x, y] = clampPosition(
    controls,
    centerX - (centerX - state.positionX) * ratio,
    centerY - (centerY - state.positionY) * ratio,
    newScale,
  );

  void controls.setTransform(x, y, newScale, animationTime);
}
