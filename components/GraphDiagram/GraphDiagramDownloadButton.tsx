import { report } from '../../lib/bugsnag.ts';
import { $$, $optional } from 'select-dom';
import { DownloadIcon } from '../Icons.tsx';
import * as styles from './GraphDiagramDownloadButton.module.scss';
import { getDiagramElement } from './graph_util.ts';

type DownloadExtension = 'svg' | 'png';

export default function GraphDiagramDownloadButton() {
  return (
    <button
      className={styles.root}
      onClick={() => download('svg')}
      title="Download as SVG"
      type="button"
    >
      <DownloadIcon />
    </button>
  );
}

function download(type: DownloadExtension) {
  switch (type) {
    case 'svg':
      downloadSvg();
      break;
    case 'png':
      downloadPng();
      break;
  }
}

function downloadPng() {
  const svg = getDiagramElement();

  if (!svg) return;

  const data = svg.outerHTML;
  const vb = svg.getAttribute('viewBox')?.split(' ');

  if (!vb) {
    report.error(new Error('No viewBox'));
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Number.parseInt(vb[2]);
  canvas.height = Number.parseInt(vb[3]);
  const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
  const DOMURL = window.URL || window.webkitURL;
  const img = new Image();
  const svgBlob = new Blob([data], { type: 'image/svg+xml' });
  const url = DOMURL.createObjectURL(svgBlob);

  img.onload = function () {
    ctx.drawImage(img, 0, 0);
    DOMURL.revokeObjectURL(url);
    const pngImg = canvas.toDataURL('image/png');
    generateLinkToDownload('png', pngImg);
  };
  img.src = url;
}

function downloadSvg() {
  // Get svg DOM (cloned, so we can tweak as needed for SVG export)
  const svg = getDiagramElement()?.cloneNode(true) as SVGSVGElement | undefined;
  if (!svg) return;

  // Add link(s) to font files
  $$<HTMLLinkElement>('link[rel="stylesheet"]').forEach(link => {
    if (!link.href.includes('fonts.googleapis.com')) return;

    const fontEl = document.createElement('defs');
    fontEl.innerHTML = `<defs><style type="text/css">@import url('${link.href}');</style></defs>`;
    svg.insertBefore(fontEl, svg.firstChild);
  });

  // Clone runtime stylesheet link (e.g. /npmgraph...css) into an inline style for export.
  const appStylesheetLink = $optional<HTMLLinkElement>(
    'link[rel="stylesheet"][href^="/npmgraph"]',
  );
  if (appStylesheetLink) {
    try {
      const styleEl = cloneStyleElementFromSheet(appStylesheetLink.sheet);
      if (styleEl) {
        svg.appendChild(styleEl);
      }
    } catch (err) {
      report.error(err instanceof Error ? err : new Error(String(err)));
    }
  }

  const svgData = svg.outerHTML;
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  generateLinkToDownload('svg', svgUrl);
}

function cloneStyleElementFromSheet(sheet: StyleSheet | null | undefined) {
  if (!sheet) return null;

  const cssSheet = sheet as CSSStyleSheet;
  const styleEl = document.createElement('style');

  try {
    const cssText = Array.from(cssSheet.cssRules)
      .filter(rule => rule.type !== CSSRule.MEDIA_RULE)
      .map(rule => rule.cssText)
      .join('\n');

    styleEl.textContent = cssText;

    return styleEl;
  } catch (err) {
    report.error(err instanceof Error ? err : new Error(String(err)));
    return null;
  }
}

function generateLinkToDownload(extension: DownloadExtension, link: string) {
  const name = document.title.replace(/.*- /, '').replace(/\W+/g, '_');
  const downloadLink = document.createElement('a');
  downloadLink.href = link;
  downloadLink.download = `${name}_dependencies.${extension}`;
  downloadLink.click();
}
