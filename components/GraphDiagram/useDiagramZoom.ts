import { useLayoutEffect } from 'react';
import { $ } from 'select-dom';
import useHashParam from '../../hooks/useHashParam.ts';
import {
  PARAM_ZOOM,
  ZOOM_FIT_HEIGHT,
  ZOOM_FIT_WIDTH,
  ZOOM_NONE,
} from '../../lib/constants.ts';
import * as utilities from '../ui/utilities.module.scss';
import * as styles from './GraphDiagram.module.scss';

// Size the diagram element according to the zoom setting
export default function useDiagramZoom(
  diagramElement: SVGSVGElement | undefined,
) {
  const [zoom] = useHashParam(PARAM_ZOOM);

  function applyZoom() {
    const graphElement = $(`.${styles.graph}`);

    if (!graphElement || !diagramElement) {
      return;
    }

    // Note: Not using svg.getBBox() here because (for some reason???) it's
    // smaller than the actual bounding box
    const vb = diagramElement.getAttribute('viewBox')?.split(' ').map(Number);
    if (!vb) {
      return;
    }

    const w = vb[2];
    const h = vb[3];
    graphElement.classList.remove(utilities.dBlock);

    switch (zoom) {
      case ZOOM_NONE:
        diagramElement.setAttribute('width', String(w));
        diagramElement.setAttribute('height', String(h));
        break;

      case ZOOM_FIT_WIDTH:
        diagramElement.setAttribute('width', '100%');
        diagramElement.removeAttribute('height');
        break;

      case ZOOM_FIT_HEIGHT:
        diagramElement.removeAttribute('width');
        diagramElement.setAttribute('height', '100%');
        graphElement.classList.add(utilities.dBlock);
        break;
      default:
    }
  }

  // (Re)apply zoom if/when it changes — useLayoutEffect prevents visual flicker when switching modes
  useLayoutEffect(applyZoom, [zoom, diagramElement]);
}
