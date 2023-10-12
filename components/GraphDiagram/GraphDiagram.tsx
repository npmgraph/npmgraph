import { Graphviz } from '@hpcc-js/wasm/graphviz';
import { select } from 'd3-selection';
import React, { useEffect, useState } from 'react';
import LoadActivity from '../../lib/LoadActivity.js';
import Module from '../../lib/Module.js';
import {
  QueryType,
  getCachedModule,
  queryModuleCache,
} from '../../lib/ModuleCache.js';
import { report } from '../../lib/bugsnag.js';
import {
  PARAM_COLORIZE,
  PARAM_DEPENDENCIES,
  PARAM_VIEW_MODE,
  PARAM_ZOOM,
  ZOOM_FIT_HEIGHT,
  ZOOM_FIT_WIDTH,
  ZOOM_NONE,
} from '../../lib/constants.js';
import { createAbortable } from '../../lib/createAbortable.js';
import $ from '../../lib/dom.js';
import useGraphSelection from '../../lib/useGraphSelection.js';
import useHashParam from '../../lib/useHashParam.js';
import { useQuery } from '../../lib/useQuery.js';
import { useExcludes, useGraph, usePane } from '../App/App.js';
import {
  getColorizer,
  isSimpleColorizer,
} from '../GraphPane/colorizers/index.js';
import './GraphDiagram.scss';
import GraphDiagramDownloadButton from './GraphDiagramDownloadButton.js';
import { GraphDiagramZoomButtons } from './GraphDiagramZoomButtons.js';
import {
  DependencyKey,
  GraphState,
  composeDOT,
  gatherSelectionInfo,
  getGraphForQuery,
} from './graph_util.js';

export type ZoomOption =
  | typeof ZOOM_NONE
  | typeof ZOOM_FIT_WIDTH
  | typeof ZOOM_FIT_HEIGHT;

const graphvizP = Graphviz.load();

export default function GraphDiagram({ activity }: { activity: LoadActivity }) {
  const [query] = useQuery();
  const [depTypes] = useHashParam(PARAM_DEPENDENCIES);
  const [, setPane] = usePane();
  const [, setZenMode] = useHashParam(PARAM_VIEW_MODE);
  const [queryType, queryValue, setGraphSelection] = useGraphSelection();
  const [graph, setGraph] = useGraph();
  const [excludes, setExcludes] = useExcludes();
  const [colorize] = useHashParam(PARAM_COLORIZE);
  const [zoom] = useHashParam(PARAM_ZOOM);

  // Dependencies to include for top-level modules
  const dependencyTypes = new Set<DependencyKey>([
    'dependencies',
    'peerDependencies',
  ]);
  depTypes
    .split(/\s*,\s*/)
    .sort()
    .forEach(dtype => dependencyTypes.add(dtype as DependencyKey));

  // Signal for when Graph DOM changes
  const [domSignal, setDomSignal] = useState(0);

  async function handleGraphClick(event: React.MouseEvent) {
    const target = event.target as HTMLDivElement;

    if ($('#graph-controls').contains(target)) return;

    const el = $.up<SVGElement>(target, '.node');

    const moduleKey = el ? $(el, 'title')?.textContent?.trim() : '';
    const module = moduleKey ? getCachedModule(moduleKey) : undefined;

    // Toggle exclude filter?
    if (el && event.shiftKey) {
      if (module) {
        const isIncluded = excludes.includes(module.name);
        if (isIncluded) {
          setExcludes(excludes.filter(n => n !== module.name));
        } else {
          setExcludes([...excludes, module.name]);
        }
      }

      return;
    }

    if (el) setZenMode('');

    setGraphSelection('exact', moduleKey);
    setPane(moduleKey ? 'module' : 'graph');
  }

  function applyZoom() {
    const graphEl = $<HTMLDivElement>('#graph')[0];
    const svg = getDiagramElement();
    if (!svg) return;

    // Note: Not using svg.getBBox() here because (for some reason???) it's
    // smaller than the actual bounding box
    const vb = svg.getAttribute('viewBox')?.split(' ').map(Number);
    if (!vb) return;

    const [, , w, h] = vb;
    graphEl.classList.toggle(
      'centered',
      zoom === ZOOM_NONE && w < graphEl.clientWidth && h < graphEl.clientHeight,
    );

    switch (zoom) {
      case ZOOM_NONE:
        svg.setAttribute('width', String(w));
        svg.setAttribute('height', String(h));
        break;

      case ZOOM_FIT_WIDTH:
        svg.setAttribute('width', '100%');
        svg.removeAttribute('height');
        break;

      case ZOOM_FIT_HEIGHT:
        svg.removeAttribute('width');
        svg.setAttribute('height', '100%');
        break;
    }

    (select('#graph svg .node').node() as HTMLElement)?.scrollIntoView();
  }

  // Filter for which modules should be shown / collapsed in the graph
  function moduleFilter({ name }: { name: string }) {
    return !excludes?.includes(name);
  }

  // NOTE: Graph rendering can take a significant amount of time.  It is also dependent on UI settings.
  // Thus, it's broken up into different useEffect() actions, below.

  // Effect: Fetch modules
  useEffect(() => {
    const { signal, abort } = createAbortable();

    getGraphForQuery(query, dependencyTypes, moduleFilter).then(newGraph => {
      if (signal.aborted) return; // Check after async

      setGraph(newGraph);
    });

    return abort;
  }, [[...query].sort().join(), [...dependencyTypes].join(), excludes]);

  // Effect: Insert SVG markup into DOM
  useEffect(() => {
    const { signal, abort } = createAbortable();

    // Post-process rendered DOM
    const finish = activity.start('Rendering');

    // Render SVG markup (async)
    (async function () {
      const graphviz = await graphvizP;
      if (signal.aborted) return; // Check after all async stuff

      // Compose SVG markup
      const svgMarkup = graph?.modules.size
        ? await graphviz.dot(composeDOT(graph.modules), 'svg')
        : '<svg />';
      if (signal.aborted) return; // Check after all async stuff

      // Parse markup
      const svgDom = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml')
        .children[0] as SVGSVGElement;
      svgDom.remove();

      // Remove background element so page background shows thru
      $(svgDom, '.graph > polygon').remove();
      svgDom.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svgDom.id = 'graph-diagram';

      // Inject into DOM
      const el = $('#graph');
      getDiagramElement()?.remove();
      el.appendChild(svgDom);

      // Inject bg pattern for deprecated modules
      const PATTERN = `<pattern id="warning"
        width="12" height="12"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45 50 50)">
        <line class="line0" stroke-width="6px" x1="3" x2="3" y2="12"/>
        <line class="line1" stroke-width="6px" x1="9" x2="9" y2="12"/>
        </pattern>`;

      select('#graph svg').insert('defs', ':first-child').html(PATTERN);

      // Decorate DOM nodes with appropriate classname
      for (const el of $<SVGPathElement>('#graph g.node')) {
        // Find module this node represents
        const key = $(el, 'text')[0].textContent;
        if (!key) continue;

        const m = getCachedModule(key);

        const graphInfo = graph?.modules.get(key);
        let isPeer;
        if (graphInfo) {
          let peerDeps = 0;
          for (const { type } of graphInfo.upstream) {
            if (type === 'peerDependencies') {
              peerDeps++;
            }
          }
          isPeer = peerDeps > 1 && peerDeps === graphInfo.upstream.size;
        } else {
          isPeer = false;
        }

        // Style peer dependencies
        el.classList.toggle('peer', isPeer);

        if (!m) continue;

        if (m?.package.deprecated) {
          el.classList.add('warning');
        }

        if (m.name) {
          el.dataset.module = m.key;
        } else {
          report.warn(Error(`Bad replace: ${key}`));
        }

        if (!moduleFilter(m)) {
          el.classList.add('collapsed');
        }

        const pkg = m.package;
        if (pkg._stub) {
          el.classList.add('stub');
        }
      }

      setPane(graph?.modules.size ? 'graph' : 'info');

      // Signal other hooks that graph DOM has changed
      setDomSignal(domSignal + 1);

      finish?.();
    })();

    return () => {
      finish();
      abort();
    };
  }, [graph]);

  // Effect: render graph selection
  useEffect(
    () => updateSelection(graph, queryType, queryValue),
    [queryType, queryValue, domSignal],
  );

  // Effect: Colorize nodes
  useEffect(() => {
    const svg = getDiagramElement();
    if (!svg) return;
    colorizeGraph(svg, colorize);
  }, [colorize, domSignal]);

  // (Re)apply zoom if/when it changes
  useEffect(applyZoom, [zoom, domSignal]);

  return (
    <div id="graph" onClick={handleGraphClick}>
      <div id="graph-controls">
        <GraphDiagramZoomButtons />
        <GraphDiagramDownloadButton />
      </div>
    </div>
  );
}

export function updateSelection(
  graph: GraphState | null,
  queryType: QueryType,
  queryValue: string,
) {
  if (!graph) return;

  const modules = queryModuleCache(queryType, queryValue);

  // Get selection info
  const si = gatherSelectionInfo(graph, modules.values());
  const isSelection = modules.size > 0;

  // Set selection classes for node elements
  for (const el of [...$<SVGElement>('svg .node[data-module]')]) {
    const moduleKey = el.dataset.module ?? '';
    const isSelected = si.selectedKeys.has(moduleKey);
    const isUpstream = si.upstreamModuleKeys.has(moduleKey);
    const isDownstream = si.downstreamModuleKeys.has(moduleKey);
    el.classList.toggle('selected', isSelection && isSelected);
    el.classList.toggle('upstream', isSelection && isUpstream);
    el.classList.toggle('downstream', isSelection && isDownstream);
    el.classList.toggle(
      'unselected',
      isSelection && !isSelected && !isUpstream && !isDownstream,
    );
  }

  // Set selection classes for edge elements
  for (const titleEl of [...$<SVGElement>('svg .edge')]) {
    const edgeTitle = $(titleEl, '.edge title')?.textContent ?? '';
    const edge = $.up<SVGPathElement>(titleEl, '.edge');
    if (!edge) continue;

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
      edge.parentElement?.appendChild(edge);
    }
  }
}

async function colorizeGraph(svg: SVGSVGElement, colorize: string) {
  const colorizer = getColorizer(colorize);

  if (!colorizer) {
    // Unset all node colors
    $(svg, 'g.node path').attr('style', undefined);
    return;
  }

  const moduleEls = $<SVGGElement>(svg, 'g.node');

  if (isSimpleColorizer(colorizer)) {
    // For each node in graph
    for (const el of moduleEls) {
      const moduleKey = el.dataset.module;
      const m = moduleKey && getCachedModule(moduleKey);
      const elPath = $<SVGPathElement>(el, 'path')[0];

      // Reset color if there's no module
      if (!m) {
        elPath.style.fill = '';
        continue;
      }

      // Colorize it (async)
      colorizer.colorForModule(m).then(color => {
        elPath.style.fill = color ?? '';
      });
    }
  } else {
    // Bundle up modules
    const modules: Module[] = [];
    for (const el of moduleEls) {
      const moduleKey = el.dataset.module;
      const m = moduleKey && getCachedModule(moduleKey);
      if (m) modules.push(m);
    }

    // Get colors for all modules
    const colors = await colorizer.colorsForModules(modules);

    // Apply colors
    for (const el of moduleEls) {
      const moduleKey = el.dataset.module;
      const m = moduleKey && getCachedModule(moduleKey);
      const elPath = $<SVGPathElement>(el, 'path')[0];

      elPath.style.fill = (m && colors.get(m)) ?? '';
    }
  }

  return;
}

export function getDiagramElement() {
  return document.querySelector<SVGSVGElement>('#graph svg#graph-diagram');
}
