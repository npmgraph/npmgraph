import type { Graphviz } from '@hpcc-js/wasm-graphviz';
import { select } from 'd3-selection';
import { use, useMemo } from 'react';
import { $$optional, $optional } from 'select-dom';
import useHashParam from '../../hooks/useHashParam.ts';
import { PARAM_SIZING } from '../../lib/constants.ts';
import { flashError } from '../../lib/flash.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { composeDOT, type GraphState } from '../../lib/graph-util.ts';
import memoizeRecent from '../../lib/memoizeRecent.ts';
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

async function loadGraphviz() {
  const { Graphviz } = await import('@hpcc-js/wasm-graphviz');
  return Graphviz.load();
}

// Keep graphviz in a secondary bundle but load it eagerly
const graphvizPromise = loadGraphviz();

// Layout is slow, so remember the latest ones (e.g. when going back to the Graph tab)
const layout = memoizeRecent((dot: string, graphviz: Graphviz) =>
  graphviz.dot(dot, 'svg'),
);

// Compose the SVG markup of the graph
function composeSvgMarkup(
  graph: GraphState,
  hasSizing: boolean,
  graphviz: Graphviz,
) {
  if (graph.moduleInfos.size === 0) {
    return '<svg />';
  }

  const dotDoc = composeDOT({ graph, sizing: hasSizing });

  try {
    return layout(dotDoc, graphviz);
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
  const [graph] = useGlobalState('graph');
  const [sizing] = useHashParam(PARAM_SIZING);
  const graphviz = use(graphvizPromise);

  return useMemo(
    () =>
      createDiagram(
        composeSvgMarkup(graph, sizing !== null, graphviz),
        isModuleVisible,
      ),
    [graph, graphviz, isModuleVisible, sizing],
  );
}
