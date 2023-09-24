import { Graphviz } from '@hpcc-js/wasm/graphviz';
import { select } from 'd3-selection';
import React, { useEffect, useState } from 'react';
import {
  useColorize,
  useExcludes,
  useGraph,
  useIncludeDev,
  useInspectorOpen,
  useModule,
  usePane,
  useQuery,
} from '../components/App.js';
import LoadActivity from '../util/LoadActivity.js';
import Module from '../util/Module.js';
import { getCachedModule } from '../util/ModuleRegistry.js';
import { report } from '../util/bugsnag.js';
import { createAbortable } from '../util/createAbortable.js';
import $, { tagElement } from '../util/dom.js';
import fetchJSON from '../util/fetchJSON.js';
import { NPMSIOData } from '../util/fetch_types.js';
import { GraphDiagramControls } from './GraphDiagramControls.js';
import { composeDOT, hslFor, modulesForQuery } from './graph_util.js';
import '/css/Graph.scss';

const graphvizP = Graphviz.load();

export const COLORIZE_MODULE_ESM = '#ffff66';
export const COLORIZE_MODULE_CJS = '#ffaa66';

export default function GraphDiagram({ activity }: { activity: LoadActivity }) {
  const [query] = useQuery();
  const [includeDev] = useIncludeDev();
  const [, setPane] = usePane();
  const [, setInspectorOpen] = useInspectorOpen();
  const [, setModule] = useModule();
  const [graph, setGraph] = useGraph();
  const [excludes, setExcludes] = useExcludes();
  const [colorize] = useColorize();
  const [zoom, setZoom] = useState(0);

  // Signal for when Graph DOM changes
  const [domSignal, setDomSignal] = useState(0);

  async function handleGraphClick(event: React.MouseEvent) {
    const target = event.target as HTMLDivElement;

    if ($('#graph-controls').contains(target)) return;

    const el = $.up<SVGElement>(target, '.node');

    let module: Module | undefined;
    if (el) {
      const key = $(el, 'title')?.textContent?.trim();
      module = getCachedModule(key);
      if (event.shiftKey) {
        if (module) {
          const isIncluded = excludes.includes(module.name);
          if (isIncluded) {
            // Why is `module?.` needed here, but not above or below???
            setExcludes(excludes.filter(n => n !== module?.name));
          } else {
            setExcludes([...excludes, module.name]);
          }
        }

        return;
      }
    }

    selectTag(el, true);

    if (el) setInspectorOpen(true);

    setModule(module);
    setPane(module ? 'module' : 'graph');
  }

  function applyZoom() {
    const graphEl = $<HTMLDivElement>('#graph')[0];
    const svg = $<SVGSVGElement>('#graph svg')[0];
    if (!svg) return;

    // Note: Not using svg.getBBox() here because (for some reason???) it's
    // smaller than the actual bounding box
    const vb = svg.getAttribute('viewBox')?.split(' ').map(Number);
    if (!vb) return;

    const [, , w, h] = vb;
    graphEl.classList.toggle(
      'centered',
      zoom === 0 && w < graphEl.clientWidth && h < graphEl.clientHeight,
    );

    switch (zoom) {
      case 0:
        svg.setAttribute('width', String(w));
        svg.setAttribute('height', String(h));
        break;

      case 1:
        svg.setAttribute('width', '100%');
        svg.removeAttribute('height');
        break;

      case 2:
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
    setGraph(null);
    setModule(undefined);

    modulesForQuery(query, includeDev, moduleFilter).then(newGraph => {
      if (signal.aborted) return; // Check after async

      setGraph(newGraph);
    });

    return abort;
  }, [query, includeDev, excludes]);

  // Effect: Parse SVG markup into DOM
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

      // Inject into DOM
      const el = $('#graph');
      select('#graph svg').remove();
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

        const refTypes = graph?.referenceTypes.get(key);

        // Style peer dependencies
        if (refTypes?.has('peerDependencies') && refTypes.size === 1) {
          el.classList.add('peer');
        }

        if (!m) continue;

        if (m?.package.deprecated) {
          el.classList.add('warning');
        }

        if (m.name) {
          tagElement(el, 'module', m.name);
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
        } else {
          tagElement(el, 'maintainer', ...m.maintainers.map(m => m.name));

          tagElement(el, 'license', m.licenseString);
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

  // Effect: Colorize nodes
  useEffect(() => {
    colorizeGraph($<SVGSVGElement>('#graph svg')[0], colorize);
  }, [colorize, domSignal]);

  // (Re)apply zoom if/when it changes
  useEffect(applyZoom, [zoom, domSignal]);

  $('title').innerText = `npmgraph - ${query.join(', ')}`;

  return (
    <div id="graph" onClick={handleGraphClick}>
      <GraphDiagramControls zoom={zoom} setZoom={setZoom} />
    </div>
  );
}

export function selectTag(
  tag: string | HTMLElement | SVGElement | undefined,
  selectEdges = false,
  scroll = false,
) {
  // If tag (element) is already selected, do nothing
  if (
    tag instanceof HTMLElement &&
    tag.classList &&
    tag.classList.contains('selected')
  ) {
    return;
  }

  // Unselect nodes and edges
  $('svg .node').forEach(el => el.classList.remove('selected'));
  $('svg .edge').forEach(el => el.classList.remove('selected'));

  if (!tag) return;

  let els: (HTMLElement | SVGElement)[];

  if (typeof tag == 'string') {
    els = $(`svg .node.${tag}`);
  } else {
    els = [tag];
  }

  // Select nodes
  els.forEach((el, i) => {
    el.classList.add('selected');
    if (i == 0 && scroll) el.scrollIntoView();
  });

  // Select edges
  if (selectEdges) {
    $('.edge title').forEach(title => {
      for (const el of els) {
        const module = getCachedModule(el.dataset.module ?? '');
        if (!module) continue;

        if ((title.textContent ?? '').indexOf(module.key) >= 0) {
          const edge = $.up<SVGPathElement>(title, '.edge');
          if (!edge) continue;

          edge.classList.add('selected');

          // Move edge to end of child list so it's painted last
          edge.parentElement?.appendChild(edge);
        }
      }
    });
  }
}

function colorizeGraph(svg: SVGSVGElement, colorize: string) {
  if (!colorize) {
    $(svg, 'g.node path').attr('style', undefined);
  } else if (colorize == 'bus') {
    for (const el of $<SVGGElement>(svg, 'g.node')) {
      const m = getCachedModule(el.dataset.module ?? '');
      $<SVGPathElement>(el, 'path')[0].style.fill = hslFor(
        ((m?.package.maintainers?.length ?? 1) - 1) / 3,
      );
    }
  } else if (colorize == 'moduleType') {
    for (const el of $<SVGGElement>('#graph g.node')) {
      const moduleName = el.dataset.module;
      if (!moduleName) continue;

      const module = getCachedModule(el.dataset.module ?? '');
      const elPath = $<SVGPathElement>(el, 'path')[0];
      if (module) {
        const url = `https://cdn.jsdelivr.net/npm/${module.key}/package.json`;
        fetchJSON<{ type: string }>(url)
          .then(pkg => {
            elPath.style.fill =
              pkg.type === 'module' ? COLORIZE_MODULE_ESM : COLORIZE_MODULE_CJS;
          })
          .catch(() => (elPath.style.fill = ''));
      } else {
        elPath.style.fill = '';
      }
    }
  } else {
    let packageNames = $<SVGGElement>('#graph g.node')
      .map(el => getCachedModule(el.dataset.module ?? '')?.name)
      .filter(Boolean);

    // npms.io limits to 250 packages, so query in batches
    const reqs: Promise<Record<string, NPMSIOData> | null>[] = [];
    const MAX_PACKAGES = 250;
    while (packageNames.length) {
      reqs.push(
        fetchJSON<Record<string, NPMSIOData>>(
          'https://api.npms.io/v2/package/mget',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(packageNames.slice(0, MAX_PACKAGES)),
          },
        ).catch(err => {
          console.error(err);
          return null;
        }),
      );
      packageNames = packageNames.slice(MAX_PACKAGES);
    }

    Promise.all(reqs)
      .then(infos => {
        // Merge results back into a single object
        const infoAccum: { [key: string]: NPMSIOData } = {};
        for (const info of infos) {
          if (!info) continue;
          Object.assign(infoAccum, info);
        }

        return infoAccum;
      })
      .then(res => {
        // TODO: 'Need hang module names on svg nodes with data-module attributes
        for (const el of $(svg, 'g.node')) {
          const key = $(el, 'text')[0].textContent;
          if (!key) return;

          const moduleName = key.replace(/@[\d.]+$/, '');
          const score = res[moduleName]?.score;
          let fill: number | undefined;
          switch (score && colorize) {
            case 'overall':
              fill = score.final;
              break;
            case 'quality':
              fill = score.detail.quality;
              break;
            case 'popularity':
              fill = score.detail.popularity;
              break;
            case 'maintenance':
              fill = score.detail.maintenance;
              break;
          }

          $<SVGPathElement>(el, 'path')[0].style.fill = fill
            ? hslFor(fill)
            : '';
        }
      });
  }
}
