import { $$, $optional } from 'select-dom';
import CopyImageIcon from '../../images/icons/copy-image.svg?react';
import DownloadIcon from '../../images/icons/download.svg?react';
import { report } from '../../lib/bugsnag.ts';
import { flash } from '../../lib/flash.ts';
import { Button, ButtonGroup } from '../Button.tsx';
import * as graphStyles from './GraphDiagram.module.scss';

type DownloadExtension = 'svg' | 'png';

function getDiagramElement() {
  return $optional<SVGSVGElement>(`.${graphStyles.graphDiagram}`);
}

export default function GraphDiagramDownloadButton() {
  return (
    <ButtonGroup>
      <Button title="Download as SVG" onClick={downloadSvg}>
        <DownloadIcon />
      </Button>
      <Button
        title="Copy as PNG image"
        onClick={() => {
          void copyPng();
        }}
      >
        <CopyImageIcon />
      </Button>
    </ButtonGroup>
  );
}

const MAX_PNG_PIXELS = 8_000_000;
const PNG_SCALE = 2;

async function renderPngBlob(): Promise<{
  blob: Blob;
  capped: boolean;
} | null> {
  const svg = getDiagramElement()?.cloneNode(true) as SVGSVGElement | undefined;
  const vb = svg?.getAttribute('viewBox')?.split(' ');

  if (!svg || !vb) {
    report.error(new Error('No viewBox'));
    return null;
  }

  const appStylesheetLink = $optional(
    'link[rel="stylesheet"][href^="/npmgraph"]',
  );
  if (appStylesheetLink) {
    const styleElement = cloneStyleElementFromSheet(appStylesheetLink.sheet);
    if (styleElement) {
      svg.append(styleElement);
    }
  }

  const width = Number(vb[2]);
  const height = Number(vb[3]);
  const maxScale = Math.sqrt(MAX_PNG_PIXELS / (width * height));
  const isCapped = PNG_SCALE > maxScale;
  const scale = isCapped ? maxScale : PNG_SCALE;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(width * scale));
  canvas.height = Math.max(1, Math.floor(height * scale));
  const ctx = canvas.getContext('2d')!;
  const img = new Image();
  const svgBlob = new Blob([new XMLSerializer().serializeToString(svg)], {
    type: 'image/svg+xml;charset=utf-8',
  });
  // eslint-disable-next-line react-doctor/no-create-object-url-without-revoke -- Revoked in the `finally` block below
  const url = URL.createObjectURL(svgBlob);

  try {
    await new Promise(resolve => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
      img.src = url;
    });

    if (img.naturalWidth === 0) {
      return null;
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(resolve => {
      canvas.toBlob(resolve, 'image/png');
    });
    return blob ? { blob, capped: isCapped } : null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function copyPng() {
  let isCapped = false;
  try {
    // write() (below) needs to be called synchronously so Safari still sees the
    // click's user activation.  Hence, we don't await here but, rather, pass a
    // promise to ClipboardItem, below
    const blobPromise = renderPngBlob().then(result => {
      if (!result) {
        throw new Error('Failed to render PNG');
      }

      isCapped = result.capped;
      return result.blob;
    });
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blobPromise }),
    ]);
    flash(
      isCapped
        ? 'Graph image copied to clipboard (scaled down to 8 megapixels)'
        : 'Graph image copied to clipboard',
    );
  } catch (error) {
    report.error(error instanceof Error ? error : new Error(String(error)));
    flash('Unable to copy image to clipboard');
  }
}

function downloadSvg() {
  // Get svg DOM (cloned, so we can tweak as needed for SVG export)
  const svg = getDiagramElement()?.cloneNode(true) as SVGSVGElement | undefined;
  if (!svg) {
    return;
  }

  // Add link(s) to font files
  for (const link of $$('link[rel="stylesheet"]')) {
    if (!link.href.includes('fonts.googleapis.com')) {
      continue;
    }

    const fontElement = document.createElement('defs');
    fontElement.innerHTML = `<defs><style type="text/css">@import url('${link.href}');</style></defs>`;
    svg.insertBefore(fontElement, svg.firstChild);
  }

  // Clone runtime stylesheet link (e.g. /npmgraph...css) into an inline style for export.
  const appStylesheetLink = $optional(
    'link[rel="stylesheet"][href^="/npmgraph"]',
  );
  if (appStylesheetLink) {
    try {
      const styleElement = cloneStyleElementFromSheet(appStylesheetLink.sheet);
      if (styleElement) {
        svg.append(styleElement);
      }
    } catch (error) {
      report.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  const svgData = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  generateLinkToDownload('svg', svgUrl);
}

function cloneStyleElementFromSheet(sheet: StyleSheet | null) {
  if (!sheet) {
    return null;
  }

  const cssSheet = sheet as CSSStyleSheet;
  const styleElement = document.createElement('style');

  try {
    const cssText = [...cssSheet.cssRules]
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- Still works
      .filter(rule => rule.type !== CSSRule.MEDIA_RULE)
      .map(rule => rule.cssText)
      .join('\n');

    styleElement.textContent = cssText;

    return styleElement;
  } catch (error) {
    report.error(error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

function generateLinkToDownload(extension: DownloadExtension, link: string) {
  const name = document.title.replace(/.*- /v, '').replaceAll(/\W+/gv, '_');
  const downloadLink = document.createElement('a');
  downloadLink.href = link;
  downloadLink.download = `${name}_dependencies.${extension}`;
  downloadLink.click();
  if (link.startsWith('blob:')) {
    setTimeout(() => {
      URL.revokeObjectURL(link);
    }, 1000);
  }
}
