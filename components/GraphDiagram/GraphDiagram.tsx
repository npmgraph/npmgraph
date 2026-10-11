import { select } from 'd3-selection';
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
  type ReactZoomPanPinchContentRef,
  TransformComponent,
  TransformWrapper,
} from 'react-zoom-pan-pinch';
import { $, $$optional } from 'select-dom';
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
import useCelebrateZeroDependencies from './useCelebrateZeroDependencies.ts';
import useGraphClick from './useGraphClick.ts';
import useLoadGraph from './useLoadGraph.ts';
import useRenderDiagram from './useRenderDiagram.ts';
import { clampPosition, getFitScale } from './viewport-util.ts';
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

  const transformRef = useRef<ReactZoomPanPinchContentRef>(null);
  const [minScale, setMinScale] = useState(0.05);
  // Dragging the graph shouldn't count as a click, which would clear the selection
  const panningRef = useRef(false);

  // Filter for which modules should be shown / collapsed in the graph
  const moduleFilter = useCallback(
    ({ name }: { name: string }) => !collapse?.includes(name),
    [collapse],
  );

  // Note: Graph rendering can take a significant amount of time.  It is also dependent on UI settings.
  // Thus, it's broken up into different useEffect() actions, below.
  // Effect: Fetch modules
  useLoadGraph(moduleFilter);
  useCelebrateZeroDependencies(moduleFilter);

  const diagramElement = useRenderDiagram(activity, moduleFilter);

  // Effect: Don't allow zooming out further than "fit to screen"
  useEffect(() => {
    const controls = transformRef.current;
    const wrapper = controls?.instance.wrapperComponent;
    const content = controls?.instance.contentComponent;
    if (!controls || !wrapper || !content) {
      return;
    }

    const update = () => {
      const fitScale = getFitScale(wrapper, content);
      if (!fitScale) {
        return;
      }

      setMinScale(fitScale);

      if (controls.instance.state.scale < fitScale) {
        void controls.fitToView({ maxScale: 1, animationTime: 0 });
        return;
      }

      const [x, y] = clampPosition(
        controls,
        controls.instance.state.positionX,
        controls.instance.state.positionY,
        controls.instance.state.scale,
      );

      void controls.setTransform(x, y, controls.instance.state.scale, 0);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(wrapper);
    observer.observe(content);
    return () => {
      observer.disconnect();
    };
  }, []);

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
      transformRef.current,
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
    <TransformWrapper
      ref={transformRef}
      centerOnInit
      minScale={minScale}
      maxScale={4}
      zoomAnimation={{ size: 0 }}
      doubleClick={{ disabled: true }}
      wheel={{
        wheelDisabled: true,
        step: 0.01,
      }}
      trackPadPanning={{
        disabled: false,
        velocityDisabled: true,
      }}
      panning={{
        // Without this it becomes a bit difficult to click on the nodes,
        // panning starts if you move by 1px and it prevents the default.
        excluded: ['node'],
      }}
      onPanning={() => {
        panningRef.current = true;
      }}
      onPanningStop={() => {
        // The click that ends a drag comes right after this
        setTimeout(() => {
          panningRef.current = false;
        }, 0);
      }}
    >
      <div className={styles.root}>
        <div className={styles.graphControls}>
          <GraphDiagramZoomButtons />
          <GraphDiagramDownloadButton />
        </div>
        <TransformComponent
          wrapperClass={styles.viewport}
          wrapperStyle={{ width: '100%', height: '100%' }}
        >
          <div
            className={styles.graph}
            onClick={event => {
              // A drag can end on a link, which shouldn't be followed
              if (panningRef.current) {
                event.preventDefault();
                return;
              }

              handleGraphClick(event);
            }}
          />
        </TransformComponent>
      </div>
    </TransformWrapper>
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
  transform: ReactZoomPanPinchContentRef | null,
  animationTime = 0,
) {
  const wrapper = transform?.instance.wrapperComponent;
  if (!transform || !wrapper || !element) {
    return;
  }

  // Center the element in the viewport, but without moving the graph away from
  // the edges (like when scrolling)
  const { scale, positionX, positionY } = transform.instance.state;
  const view = wrapper.getBoundingClientRect();
  const box = element.getBoundingClientRect();
  const [x, y] = clampPosition(
    transform,
    positionX + view.left + view.width / 2 - (box.left + box.width / 2),
    positionY + view.top + view.height / 2 - (box.top + box.height / 2),
    scale,
  );

  void transform.setTransform(x, y, scale, animationTime);
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
  transform: ReactZoomPanPinchContentRef | null = null,
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
      scrollGraphIntoView(scrollElement, transform, 300);
    } else {
      // If no selection and we haven't already scrolled to the root node as part of
      // the initial render, do that now
      scrollGraphIntoView(
        select(`.${styles.graph} svg .node`).node() as HTMLElement,
        transform,
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
