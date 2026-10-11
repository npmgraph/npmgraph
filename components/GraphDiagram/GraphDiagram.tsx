import { select } from 'd3-selection';
import { Suspense, useCallback, useEffect, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { $, $$optional, $optional } from 'select-dom';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import type LoadActivity from '../../lib/LoadActivity.ts';
import type Module from '../../lib/Module.ts';
import {
  getCachedModule,
  queryModuleCache,
  QueryType,
} from '../../lib/ModuleCache.ts';
import { PARAM_COLORIZE } from '../../lib/constants.ts';
import { cn } from '../../lib/dom.ts';
import useCollapse from '../../hooks/useCollapse.ts';
import useGraphSelection from '../../hooks/useGraphSelection.ts';
import useHashParam from '../../hooks/useHashParam.ts';
import usePrevious from '../../hooks/usePrevious.ts';
import { getColorizer, isSimpleColorizer } from '../colorizers/index.ts';
import * as styles from './GraphDiagram.module.scss';
import './graphviz.css';

import GraphDiagramDownloadButton from './GraphDiagramDownloadButton.tsx';
import { GraphDiagramZoomButtons } from './GraphDiagramZoomButtons.tsx';
import useDiagramZoom from './useDiagramZoom.ts';
import useGraphClick from './useGraphClick.ts';
import useLoadGraph from './useLoadGraph.ts';
import useRenderDiagram from './useRenderDiagram.ts';
import { type GraphState, gatherSelectionInfo } from '../../lib/graph-util.ts';
import useOnEsc from '../../hooks/useOnEsc.ts';

const idSeen = new Set<unknown>();

export default function GraphDiagram({ activity }: { activity: LoadActivity }) {
  return (
    <ErrorBoundary
      fallback={
        <div className={cn(styles.status, styles.failed)}>
          Layout failed to load
        </div>
      }
    >
      <Suspense fallback={<div className={styles.status}>Loading…</div>}>
        <GraphDiagramInner activity={activity} />
      </Suspense>
    </ErrorBoundary>
  );
}

function GraphDiagramInner({ activity }: { activity: LoadActivity }) {
  const [selectType, selectValue, setGraphSelection] = useGraphSelection();
  const [graph] = useGlobalState('graph');
  const [collapse] = useCollapse();
  const [colorize] = useHashParam(PARAM_COLORIZE);

  const handleGraphClick = useGraphClick();

  // Filter for which modules should be shown / collapsed in the graph
  const moduleFilter = useCallback(
    ({ name }: { name: string }) => !collapse?.includes(name),
    [collapse],
  );

  // Note: Graph rendering can take a significant amount of time.  It is also dependent on UI settings.
  // Thus, it's broken up into different useEffect() actions, below.
  // Effect: Fetch modules
  useLoadGraph(moduleFilter);

  const diagramElement = useRenderDiagram(activity, moduleFilter);
  useDiagramZoom(diagramElement);

  const selectedModules = useMemo(
    () =>
      graph
        ? queryModuleCache(selectType, selectValue)
        : new Map<string, Module>(),
    [graph, selectType, selectValue],
  );
  const previousSelection = usePrevious(selectedModules);
  // Effect: render graph selection
  useEffect(() => {
    if (!graph) {
      return;
    }

    updateSelection(
      graph,
      selectedModules,
      selectedModules.size > 0 || (previousSelection?.size ?? 0) === 0,
    );
  }, [diagramElement, graph, selectedModules, previousSelection]);

  // Effect: Colorize nodes
  useEffect(() => {
    if (!diagramElement) {
      return;
    }

    void colorizeGraph(diagramElement, colorize ?? '');
  }, [colorize, diagramElement]);

  // Effect: Reset graph selection on Esc key press
  useOnEsc(() => {
    setGraphSelection(QueryType.Default, '');
  });

  return (
    <div className={styles.root}>
      <div className={styles.graphControls}>
        <GraphDiagramZoomButtons />
        <GraphDiagramDownloadButton />
      </div>
      <div className={styles.graph} onClick={handleGraphClick} />
    </div>
  );
}

// @ts-expect-error Debug helper for logging when a react variable changes
function logUpdate(name: string, value: unknown) {
  if (!value) {
    if (!idSeen.has(name)) {
      console.log(name, '<undefined>');
      idSeen.add(name);
    }

    return;
  }

  if (idSeen.has(value)) {
    return;
  }

  idSeen.add(value);
  console.log(name, 'updated ->', value);
}

function scrollGraphIntoView(
  element: Element | undefined,
  scrollOptions?: ScrollToOptions,
) {
  const graphElement = $optional(`.${styles.graph}`);
  if (!graphElement || !element) {
    return;
  }

  // Bug: graphEl.scrollIntoView() doesn't work for SVG elements in
  // Firefox.  And even in Chrome it just scrolls the element to *barely*
  // be in view, which isn't really what we want.  (We'd like element to
  // be centered in the view.)  So, instead, we manually compute the
  // scroll coordinates.
  const { top: elementTop, left: elementLeft } =
    element.getBoundingClientRect();
  const left =
    graphElement.scrollLeft + elementLeft - graphElement.clientWidth / 2;
  const top =
    graphElement.scrollTop + elementTop - graphElement.clientHeight / 2;

  graphElement.scrollTo({ left, top, ...scrollOptions });
}

type SelectionInfo = ReturnType<typeof gatherSelectionInfo>;

// Returns the selected node element (if multiple, the last one)
function updateNodeSelection(si: SelectionInfo, isSelection: boolean) {
  let scrollElement: HTMLElement | undefined;
  for (const element of $$optional('svg .node[data-module]')) {
    const moduleKey = element.dataset['module'] ?? '';
    const isSelected = si.selectedKeys.has(moduleKey);
    const isUpstream = si.upstreamModuleKeys.has(moduleKey);
    const isDownstream = si.downstreamModuleKeys.has(moduleKey);
    element.classList.toggle('selected', isSelection && isSelected);
    element.classList.toggle('upstream', isSelection && isUpstream);
    element.classList.toggle('downstream', isSelection && isDownstream);
    element.classList.toggle(
      'unselected',
      isSelection && !isSelected && !isUpstream && !isDownstream,
    );

    if (isSelection && isSelected) {
      scrollElement = element;
    }
  }

  return scrollElement;
}

function updateEdgeSelection(si: SelectionInfo, isSelection: boolean) {
  for (const edge of $$optional('svg g.edge')) {
    const edgeTitle = $('title', edge)?.textContent ?? '';
    const isUpstream = si.upstreamEdgeKeys.has(edgeTitle);
    const isDownstream = si.downstreamEdgeKeys.has(edgeTitle);
    edge.classList.toggle('upstream', isSelection && isUpstream);
    edge.classList.toggle('downstream', isSelection && isDownstream);
    edge.classList.toggle(
      'unselected',
      isSelection && !isUpstream && !isDownstream,
    );

    // Move edge to end of child list so it's painted last
    if (isUpstream || isDownstream) {
      edge.parentElement?.append(edge);
    }
  }
}

function updateSelection(
  graph: GraphState,
  modules: Map<string, Module>,
  shouldScrollToSelected = true,
) {
  // Get selection info
  const si = gatherSelectionInfo(graph, modules.values());
  const isSelection = modules.size > 0;

  // Set selection classes for node and edge elements
  const scrollElement = updateNodeSelection(si, isSelection);
  updateEdgeSelection(si, isSelection);

  if (shouldScrollToSelected) {
    // Scroll to selected element (if multiple elements, this scrolls to last one)
    if (scrollElement) {
      scrollGraphIntoView(scrollElement, { behavior: 'smooth' });
    } else {
      // If no selection and we haven't already scrolled to the root node as part of
      // the initial render, do that now
      scrollGraphIntoView(
        select(`.${styles.graph} svg .node`).node() as HTMLElement,
      );
    }
  }
}

async function colorizeGraph(svg: SVGSVGElement, colorize: string) {
  const colorizer = getColorizer(colorize);

  if (!colorizer) {
    // Unset all node colors
    for (const node of $$optional('g.node path', svg)) {
      node.removeAttribute('style');
    }

    return;
  }

  const moduleEls = $$optional('g.node', svg);

  if (isSimpleColorizer(colorizer)) {
    // For each node in graph
    for (const element of moduleEls) {
      const moduleKey = element.dataset['module'];
      const m = moduleKey && getCachedModule(moduleKey);
      const elementPath = $('path', element);

      // Reset color if there's no module
      if (!m) {
        elementPath.style.fill = '';
        continue;
      }

      // Colorize it (async)
      void colorizer
        .colorForModule(m)
        .catch(error => {
          console.warn(`Error colorizing ${m.name}: ${error.message}`);
          return null;
        })
        .then(color => {
          elementPath.style.fill = color ?? '';
        });
    }
  } else {
    // Bundle up modules
    const modules: Module[] = [];
    for (const element of moduleEls) {
      const moduleKey = element.dataset['module'];
      const m = moduleKey && getCachedModule(moduleKey);
      if (m) {
        modules.push(m);
      }
    }

    // Get colors for all modules
    const colors = await colorizer.colorsForModules(modules);

    // Apply colors
    for (const element of moduleEls) {
      const moduleKey = element.dataset['module'];
      const m = moduleKey && getCachedModule(moduleKey);
      const elementPath = $('path', element);
      elementPath.style.fill = (m && colors.get(m)) ?? '';
    }
  }
}
