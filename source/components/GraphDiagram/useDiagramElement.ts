import { select } from 'd3-selection';
import { useState } from 'react';
import { $$optional, $optional } from 'select-dom';
import { useActivity } from '../../hooks/useActivity.ts';
import useAsyncEffect from '../../hooks/useAsyncEffect.ts';
import useHashParam from '../../hooks/useHashParam.ts';
import { PARAM_SIZING } from '../../lib/constants.ts';
import { flashError } from '../../lib/flash.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { composeDOT, type GraphState } from '../../lib/graph-util.ts';
import { layout } from '../../lib/graphviz.ts';
import { getCachedModule } from '../../lib/ModuleCache.ts';
import svgDefs from './GraphDiagram.defs.svg?raw';
import * as styles from './GraphDiagram.module.scss';

function decorateGraphNodes(
  element: Element,
  isModuleVisible: ({ name }: { name: string }) => boolean,
) {
  for (const nodeElement of $$optional('g.node', element)) {
    const key = $optional(':scope > title', nodeElement)?.textContent!.trim();
    if (!key) {
      continue;
    }

    const module = getCachedModule(key);
    if (!module) {
      continue;
    }

    // Safari doesn't make SVG links focusable on its own
    for (const link of $$optional('a', nodeElement)) {
      link.setAttribute('tabindex', '0');
    }

    if (module.package.deprecated) {
      nodeElement.classList.add('warning');
    }

    if (module.name) {
      nodeElement.dataset['module'] = module.key;
    } else {
      reportError(new Error(`Bad replace: ${key}`));
    }

    if (!isModuleVisible(module)) {
      nodeElement.classList.add('collapsed');
    }

    if (module.isStub) {
      nodeElement.classList.add('stub');
    }
  }
}

// Compose the SVG markup of the graph
async function composeSvgMarkup(graph: GraphState, hasSizing: boolean) {
  const dotDoc = composeDOT({ graph, sizing: hasSizing });

  try {
    return await layout(dotDoc);
  } catch (error) {
    console.error(error);
    flashError('Error while rendering graph');
    return '<svg />';
  }
}

// Create the diagram element from the SVG markup
function createDiagram(
  svgMarkup: string,
  isModuleVisible: ({ name }: { name: string }) => boolean,
) {
  // Parse markup
  const svgDom = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml')
    .firstElementChild as SVGSVGElement;
  svgDom.remove();

  // Remove background element so page background shows thru
  $optional('.graph > polygon', svgDom)?.remove();
  svgDom.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svgDom.classList.add(styles.graphDiagram);

  // Show the diagram at its natural size, the viewport handles zooming.
  // Note: Not using svg.getBBox() here because (for some reason???) it's
  // smaller than the actual bounding box
  const [width, height] =
    svgDom.getAttribute('viewBox')?.split(' ').slice(2) ?? [];
  if (width && height) {
    svgDom.setAttribute('width', width);
    svgDom.setAttribute('height', height);
  }

  // Inject SVG definitions: warning pattern and collapsed-node outline
  select(svgDom).insert('defs', ':first-child').html(svgDefs);

  decorateGraphNodes(svgDom, isModuleVisible);

  return svgDom;
}

// Create the SVG element of the graph (it's up to the caller to put it in the DOM)
export default function useDiagramElement(
  isModuleVisible: ({ name }: { name: string }) => boolean,
) {
  const activity = useActivity();
  const [graph] = useGlobalState('graph');
  const [sizing] = useHashParam(PARAM_SIZING);
  // The previous element stays until the new one is ready
  const [diagramElement, setDiagramElement] = useState<SVGSVGElement>();

  // `isModuleVisible` isn't a dep because it changes before the graph that reflects it is loaded.
  useAsyncEffect(
    async signal => {
      // Nothing to lay out
      if (graph.moduleInfos.size === 0) {
        setDiagramElement(undefined);
        return;
      }

      const finish = activity.start('Rendering');
      try {
        const svgMarkup = await composeSvgMarkup(graph, sizing !== null);
        if (!signal.aborted) {
          setDiagramElement(createDiagram(svgMarkup, isModuleVisible));
        }
      } finally {
        finish();
      }
    },
    [graph, sizing],
  );

  return diagramElement;
}
